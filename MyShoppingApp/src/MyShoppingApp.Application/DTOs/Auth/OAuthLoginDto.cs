namespace MyShoppingApp.Application.DTOs.Auth;

public class OAuthLoginDto
{
    // Frontend'den Google/Apple üzerinden alınan JWT token buraya gelir
    public string IdToken { get; set; } = string.Empty; 
    public string Provider { get; set; } = string.Empty; // "Google" veya "Apple"
}
