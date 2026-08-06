namespace MyShoppingApp.Application.DTOs.ShoppingList;

public record CreateListDto(string? Title, string? Category, string? Tag);
public record UpdateListDto(string? Tag);
public record CreateItemDto(string ItemName, int Amount);
public record UpdateItemDto(string? ItemName, int? Amount, bool? IsCompleted);
