namespace MyShoppingApp.Application.DTOs.Auth;

public record RegisterDto(string Email, string Password, string Name);
public record LoginDto(string Email, string Password);
public record ForgotPasswordDto(string Email);
public record ResetPasswordDto(string Email, string Token, string NewPassword);
public record ConfirmDeleteAccountDto(string Otp);

public record LoginResponseDto(string Message, string Token, string Role, DateTime? LastLoginAt);
