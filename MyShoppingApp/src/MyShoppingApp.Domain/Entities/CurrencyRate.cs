namespace MyShoppingApp.Domain.Entities;

public class CurrencyRate
{
    public int Id { get; set; }
    public string Currency { get; set; } = string.Empty;
    public double Rate { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
