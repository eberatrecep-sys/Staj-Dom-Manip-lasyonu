namespace MyShoppingApp.Application.DTOs.Auth;

public record RegisterDto(string Email, string Password);
public record LoginDto(string Email, string Password);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Token, string NewPassword);

public record LoginResponseDto(string Message, string Token, string Role, DateTime? LastLoginAt);
