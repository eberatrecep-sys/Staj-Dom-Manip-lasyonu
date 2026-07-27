using MyShoppingApp.Application.DTOs.Auth;
using MyShoppingApp.Application.DTOs.Common;

namespace MyShoppingApp.Application.Interfaces;

public interface IAuthService
{
    Task<MessageResponseDto> RegisterAsync(RegisterDto dto);
    Task<LoginResponseDto> LoginAsync(LoginDto dto);
    Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto);
    Task<MessageResponseDto> ResetPasswordAsync(ResetPasswordDto dto);
}
