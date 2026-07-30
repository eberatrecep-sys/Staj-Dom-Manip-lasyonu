namespace MyShoppingApp.Domain.Entities;

public class ItemImage
{
    public int Id { get; set; }
    public int ShoppingListItemId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ShoppingListItem ShoppingListItem { get; set; } = null!;
}
