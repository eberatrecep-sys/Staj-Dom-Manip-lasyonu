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
    private readonly IEmailService _emailService;
    private readonly IOtpService _otpService;

    public AuthService(
        IUserRepository userRepository, 
        string jwtSecret, 
        IFileStorageService fileStorageService,
        IEmailService emailService,
        IOtpService otpService)
    {
        _userRepository = userRepository;
        _jwtSecret = jwtSecret;
        _fileStorageService = fileStorageService;
        _emailService = emailService;
        _otpService = otpService;
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

        // Generate OTP
        var otp = await _otpService.GenerateOtpAsync(dto.Email, "password_reset");

        // Send OTP via Email
        var subject = "Şifre Sıfırlama Kodunuz (OTP)";
        var body = $"<h1>Şifre Sıfırlama</h1><p>Şifrenizi sıfırlamak için onay kodunuz: <strong>{otp}</strong></p><p>Bu kod 3 dakika boyunca geçerlidir.</p>";
        await _emailService.SendEmailAsync(dto.Email, subject, body, isHtml: true);

        return new MessageResponseDto("Şifre sıfırlama kodunuz (OTP) e-posta adresinize gönderildi.");
    }

    public async Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var user = await _userRepository.GetByEmailAsync(dto.Email)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        // We use Token field in dto for the OTP code
        var isValid = await _otpService.ValidateOtpAsync(dto.Email, dto.Token, "password_reset");
        if (!isValid)
            throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
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

        return _fileStorageService.GenerateSignedUrl(url, TimeSpan.FromHours(1));
    }

    public async Task<MessageResponseDto> RequestAccountDeletionAsync(int userId)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        // Generate OTP
        var otp = await _otpService.GenerateOtpAsync(user.Email, "account_deletion");

        // Send OTP via Email
        var subject = "Hesap Silme Onay Kodunuz (OTP)";
        var body = $"<h1>Hesap Silme Onayı</h1><p>Hesabınızı silmek için onay kodunuz: <strong>{otp}</strong></p><p>Bu işlem geri alınamaz. Eğer bu işlemi siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p><p>Bu kod 3 dakika boyunca geçerlidir.</p>";
        await _emailService.SendEmailAsync(user.Email, subject, body, isHtml: true);

        return new MessageResponseDto("Hesap silme onay kodunuz (OTP) e-posta adresinize gönderildi.");
    }

    public async Task<MessageResponseDto> ConfirmAccountDeletionAsync(int userId, string otp)
    {
        var user = await _userRepository.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        var isValid = await _otpService.ValidateOtpAsync(user.Email, otp, "account_deletion");
        if (!isValid)
            throw new InvalidOperationException("Geçersiz veya süresi dolmuş kod.");

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);

        return new MessageResponseDto("Hesabınız başarıyla silindi.");
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
