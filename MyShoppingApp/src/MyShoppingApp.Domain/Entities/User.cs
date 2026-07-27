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

    public ICollection<ShoppingList> ShoppingLists { get; set; } = new List<ShoppingList>();
}
