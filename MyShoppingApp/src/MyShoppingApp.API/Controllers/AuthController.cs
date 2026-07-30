using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

// [ApiController]: Bu sınıfın bir REST API denetleyicisi (Controller) olduğunu belirtir.
// Model doğrulama hatalarını otomatik yakalar (örn: eksik email girildiğinde otomatik 400 Bad Request döner).
[ApiController]
// [Route]: İsteklerin hangi URL şablonuyla karşılanacağını belirler. "api/auth" istekleri buraya yönlendirilir.
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Bağımlılık Enjeksiyonu (Dependency Injection): 
    // ASP.NET Core, Program.cs'de kaydettiğimiz IAuthService somut sınıfını constructor üzerinden buraya otomatik aktarır.
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // [HttpPost("register")]: POST metoduyla "api/auth/register" adresine gelen istekleri dinler.
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            // [FromBody]: Gelen HTTP gövdesindeki (JSON) verileri otomatik olarak C# nesnesi olan RegisterDto'ya eşler.
            var result = await _authService.RegisterAsync(dto);
            // 201 Created durum kodu döner. Kayıt oluşturma işlemleri için en uygun HTTP durum kodudur.
            return StatusCode(201, result);
        }
        catch (Exception)
        {
            // 400 Bad Request döner. Hatalı istek durumu.
            return BadRequest(new { error = "Bu e-posta zaten kullanılıyor olabilir." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            // 200 OK döner. Başarılı okuma veya işlem durumlarında kullanılır.
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            // 404 Not Found. Aranan kullanıcı bulunamadığında döner.
            return NotFound(new { error = "Kullanıcı bulunamadı." });
        }
        catch (UnauthorizedAccessException)
        {
            // 401 Unauthorized. Giriş şifresi yanlış olduğunda döner.
            return Unauthorized(new { error = "Yanlış şifre." });
        }
        catch (Exception)
        {
            // 500 Internal Server Error. Sunucu tarafında beklenmeyen genel bir hata oluştuğunda döner.
            return StatusCode(505, new { error = "Sunucu hatası." });
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        try
        {
            var result = await _authService.ForgotPasswordAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Kullanıcı bulunamadı." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Sunucu hatası" });
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var response = await _authService.ResetPasswordAsync(dto);
        return Ok(response);
    }

    [HttpPost("profile-picture")]
    [MyShoppingApp.API.Attributes.AllowedExtensions(new[] { ".jpg", ".jpeg", ".png" })]
    [MyShoppingApp.API.Attributes.MaxFileSize(5 * 1024 * 1024)] // 5MB
    public async Task<IActionResult> UploadProfilePicture(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "Lütfen bir dosya seçin." });

        var userIdClaim = User.FindFirst("userId")?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return Unauthorized(new { Message = "Kullanıcı kimliği doğrulanamadı." });

        var url = await _authService.UploadProfilePictureAsync(userId, file.OpenReadStream(), file.FileName, file.ContentType);
        
        return Ok(new { Url = url, Message = "Profil fotoğrafı güncellendi." });
    }
}
