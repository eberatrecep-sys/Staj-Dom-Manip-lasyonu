using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly string _jwtSecret;
    private readonly IFileStorageService _fileStorageService;

    public AuthService(IUserRepository userRepository, string jwtSecret, IFileStorageService fileStorageService)
    {
        _userRepository = userRepository;
        _jwtSecret = jwtSecret;
        _fileStorageService = fileStorageService;
    }

    public async Task<MessageResponseDto> RegisterAsync(RegisterDto dto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = passwordHash
        };

        await _userRepository.CreateAsync(user);
        return new MessageResponseDto("Kullanıcı oluşturuldu");
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Yanlış şifre.");

        var previousLoginAt = user.LastLoginAt;
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        var token = GenerateJwtToken(user);
        return new LoginResponseDto("Giriş başarılı", token, user.Role.ToString(), previousLoginAt);
    }

    public async Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
        user.ResetToken = resetToken;
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.UpdateAsync(user);

        Console.WriteLine($"\n[GİZLİ KOD] {dto.Email} için şifre sıfırlama linkiniz:");
        Console.WriteLine($"http://localhost:5173/reset-password?token={resetToken}\n");

        return new MessageResponseDto("Sıfırlama linki oluşturuldu (Terminali kontrol et)");
    }

    public async Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userRepository.GetByResetTokenAsync(dto.Token)
            ?? throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        if (user.ResetTokenExpiry == null || user.ResetTokenExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;
        await _userRepository.UpdateAsync(user);

        return new MessageResponseDto("Şifreniz başarıyla değiştirildi.");
    }

    public async Task<string> UploadProfilePictureAsync(int userId, Stream fileStream, string fileName, string contentType)
    {
        var user = await _userRepository.GetByIdAsync(userId) 
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        // Eski resmi sil
        if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
        {
            await _fileStorageService.DeleteFileAsync(user.ProfilePictureUrl);
        }

        var url = await _fileStorageService.UploadFileAsync(fileStream, fileName, contentType);
        
        user.ProfilePictureUrl = url;
        await _userRepository.UpdateAsync(user);

        return url;
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("userId", user.Id.ToString()),
            new Claim("name", user.Name ?? string.Empty),
            new Claim("email", user.Email ?? string.Empty),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            expires: DateTime.UtcNow.AddDays(1),
            claims: claims,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
