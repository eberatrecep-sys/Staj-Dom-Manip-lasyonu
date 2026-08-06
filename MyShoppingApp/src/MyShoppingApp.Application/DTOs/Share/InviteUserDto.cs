namespace MyShoppingApp.Application.DTOs.Share;

public class InviteUserDto
{
    public int ListId { get; set; }
    public string TargetEmail { get; set; } = string.Empty;
}
