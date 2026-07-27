namespace MyShoppingApp.Domain.Entities;

public class ShoppingListItem
{
    public int Id { get; set; }
    public int ListId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public int Amount { get; set; }
    public bool IsCompleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ShoppingList List { get; set; } = null!;
}
