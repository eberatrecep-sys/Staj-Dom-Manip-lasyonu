using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly string _jwtSecret;

    public AuthService(IUserRepository userRepository, string jwtSecret)
    {
        _userRepository = userRepository;
        _jwtSecret = jwtSecret;
    }

    public async Task<object> RegisterAsync(RegisterDto dto)
    {
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = passwordHash
        };

        await _userRepository.CreateAsync(user);
        return new { message = "Kullanıcı oluşturuldu" };
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

    public async Task<object> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();
        user.ResetToken = resetToken;
        user.ResetTokenExpiry = DateTime.UtcNow.AddHours(1);
        await _userRepository.UpdateAsync(user);

        Console.WriteLine($"\n[GİZLİ KOD] {dto.Email} için şifre sıfırlama linkiniz:");
        Console.WriteLine($"http://localhost:5173/reset-password?token={resetToken}\n");

        return new { message = "Sıfırlama linki oluşturuldu (Terminali kontrol et)" };
    }

    public async Task<object> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userRepository.GetByResetTokenAsync(dto.Token)
            ?? throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        if (user.ResetTokenExpiry == null || user.ResetTokenExpiry < DateTime.UtcNow)
            throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.ResetToken = null;
        user.ResetTokenExpiry = null;
        await _userRepository.UpdateAsync(user);

        return new { message = "Şifreniz başarıyla değiştirildi." };
    }

    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim("userId", user.Id.ToString()),
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
