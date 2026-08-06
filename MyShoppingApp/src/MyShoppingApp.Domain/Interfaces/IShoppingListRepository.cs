using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Domain.Interfaces;

public interface IShoppingListRepository
{
    Task<List<ShoppingList>> GetAllByUserIdAsync(int userId);
    Task<ShoppingList?> GetByIdWithItemsAsync(int id);
    Task<ShoppingList> CreateAsync(ShoppingList list);
    Task UpdateAsync(ShoppingList list);
    Task DeleteAsync(ShoppingList list);
    Task<ShoppingListItem> AddItemAsync(ShoppingListItem item);
    Task<ShoppingListItem?> GetItemByIdAsync(int itemId);
    Task UpdateItemAsync(ShoppingListItem item);
    Task DeleteItemAsync(ShoppingListItem item);
    Task<List<string>> GetItemSuggestionsAsync(int userId, string query);
}
