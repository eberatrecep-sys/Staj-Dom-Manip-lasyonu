using System.ComponentModel.DataAnnotations;

namespace MyShoppingApp.Application.DTOs.Auth;

public class ResendOtpRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Purpose { get; set; } = string.Empty; // "password_reset" veya "account_deletion"
}
