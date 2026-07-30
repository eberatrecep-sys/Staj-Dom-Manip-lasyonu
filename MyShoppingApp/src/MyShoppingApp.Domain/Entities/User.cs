using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? ResetToken { get; set; }
    public DateTime? ResetTokenExpiry { get; set; }
    public DateTime? LastLoginAt { get; set; }
    public Role Role { get; set; } = Role.USER;
    public string? ProfilePictureUrl { get; set; }

    public ICollection<ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList>();
    
    // Sharing relationships
    public ICollection<ShoppingList> SharedLists { get; set; } = new List<ShoppingList>();
    public ICollection<ListShareRequest> SentShareRequests { get; set; } = new List<ListShareRequest>();
    public ICollection<ListShareRequest> ReceivedShareRequests { get; set; } = new List<ListShareRequest>();
}
