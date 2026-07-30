namespace MyShoppingApp.Domain.Entities;

public class ShoppingList
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Title { get; set; } = "My List";
    public string Category { get; set; } = "Recents";
    public string? Tag { get; set; }
    public bool IsFavorite { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<ShoppingListItem> Items { get; set; } = new List<ShoppingListItem>();
    
    // Sharing relationships
    public ICollection<User> SharedWithUsers { get; set; } = new List<User>();
    public ICollection<ListShareRequest> ShareRequests { get; set; } = new List<ListShareRequest>();
}
