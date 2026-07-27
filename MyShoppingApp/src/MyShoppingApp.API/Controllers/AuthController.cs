using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var result = await _authService.RegisterAsync(dto);
            return StatusCode(201, result);
        }
        catch (Exception)
        {
            return BadRequest(new { error = "Bu e-posta zaten kullanılıyor olabilir." });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var result = await _authService.LoginAsync(dto);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { error = "Kullanıcı bulunamadı." });
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Yanlış şifre." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Sunucu hatası." });
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
        try
        {
            var result = await _authService.ResetPasswordAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return BadRequest(new { error = "Geçersiz veya süresi dolmuş kod." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Sunucu hatası" });
        }
    }
}
