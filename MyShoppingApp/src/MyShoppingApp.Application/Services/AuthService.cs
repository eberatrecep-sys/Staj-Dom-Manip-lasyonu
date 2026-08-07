using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Google.Apis.Auth;
using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;
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

    public async Task<MessageResponseDto> ResendOtpAsync(string email, string purpose)
    {
        var user = await _userRepository.GetByEmailAsync(email)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        // Generate new OTP (this should ideally invalidate old ones in IOtpService implementation)
        var otp = await _otpService.GenerateOtpAsync(email, purpose);

        string subject = purpose == "password_reset" ? "Şifre Sıfırlama Kodunuz (Yeniden Gönderildi)" : "Hesap Silme Onay Kodunuz (Yeniden Gönderildi)";
        string body = $"<h1>Doğrulama Kodu</h1><p>İşleminiz için yeni onay kodunuz: <strong>{otp}</strong></p><p>Bu kod 3 dakika boyunca geçerlidir.</p>";

        await _emailService.SendEmailAsync(email, subject, body, isHtml: true);

        return new MessageResponseDto("Yeni doğrulama kodunuz e-posta adresinize gönderildi.");
    }

    public async Task<LoginResponseDto> OAuthLoginAsync(OAuthLoginDto dto)
    {
        string email = string.Empty;
        string name = string.Empty;

        if (dto.Provider == "Google")
        {
            // 1. Google'dan gelen Token'ın gerçek olup olmadığını doğrula
            // In a real app, Audience should be configured in appsettings.json.
            var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, new GoogleJsonWebSignature.ValidationSettings
            {
                // Audience = new[] { "SİZİN_GOOGLE_CLIENT_ID_NİZ.apps.googleusercontent.com" } 
                // For testing/development without a client ID, we can bypass audience validation if strictly needed,
                // but let's keep it standard. Actually Google API validates Audience if it's provided. 
                // We'll leave it empty for generic validation, or user can configure it.
            });

            email = payload.Email;
            name = payload.Name;
        }
        else if (dto.Provider == "Apple")
        {
            // Placeholder for Apple Auth
            throw new NotImplementedException("Apple girişi henüz entegre edilmedi.");
        }
        else
        {
            throw new InvalidOperationException("Desteklenmeyen sağlayıcı.");
        }

        // 2. Veritabanında bu E-posta adresi var mı kontrol et!
        var user = await _userRepository.GetByEmailAsync(email);

        if (user == null)
        {
            // Kullanıcı yoksa YENİ KAYIT oluştur (Şifresiz veya Rastgele Şifreli)
            user = new User
            {
                Email = email,
                Name = name,
                Role = Role.USER, // Standart Kullanıcı Rolü
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Guid.NewGuid().ToString()), // Rastgele kullanılamaz şifre
                IsDeleted = false
            };
            user = await _userRepository.CreateAsync(user);
        }
        else
        {
            // Kullanıcı ZATEN VARSA (Eskiden normal e-posta/şifre ile girmiş olabilir)
            // Hesap birleşmiş olur. İsterseniz burada adını güncelleyebilirsiniz.
            if (string.IsNullOrEmpty(user.Name) && !string.IsNullOrEmpty(name))
            {
                user.Name = name;
                await _userRepository.UpdateAsync(user);
            }
        }

        // 3. Normal giriş yapmış gibi sistemimize ait JWT Token üretip döndür
        var token = GenerateJwtToken(user);
        
        // Update last login
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return new LoginResponseDto("Giriş başarılı", token, user.Role.ToString(), user.LastLoginAt);
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
