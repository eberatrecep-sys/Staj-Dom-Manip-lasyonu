using MyShoppingApp.Application.DTOs.Auth;

namespace MyShoppingApp.Application.Interfaces;

public interface IAuthService
{
    Task<object> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<object> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<object> ResetPasswordAsync(ResetPasswordDto dto);
}
