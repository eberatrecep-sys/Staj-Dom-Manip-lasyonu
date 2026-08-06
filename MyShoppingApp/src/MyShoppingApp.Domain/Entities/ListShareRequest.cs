using System.ComponentModel.DataAnnotations.Schema;
using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Domain.Entities;

public class ListShareRequest
{
    public int Id { get; set; }
    
    public int ListId { get; set; }
    public ShoppingList List { get; set; } = null!;
    
    public int SenderId { get; set; }
    public User Sender { get; set; } = null!;
    
    public int ReceiverId { get; set; }
    public User Receiver { get; set; } = null!;
    
    public ShareRequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
