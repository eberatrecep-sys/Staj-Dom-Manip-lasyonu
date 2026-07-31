using MyShoppingApp.Application.DTOs.ShoppingList;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Application.Interfaces;

public interface IShoppingListService
{
    Task<List<ShoppingList>> GetAllByUserAsync(int userId);
    Task<ShoppingList> GetByIdAsync(int id, int userId);
    Task<ShoppingList> CreateAsync(CreateListDto dto, int userId);
    Task<ShoppingList> UpdateAsync(int id, UpdateListDto dto, int userId);
    Task DeleteAsync(int id, int userId);
    Task<ShoppingListItem> AddItemAsync(int listId, CreateItemDto dto, int userId);
    Task<ShoppingListItem> UpdateItemAsync(int listId, int itemId, UpdateItemDto dto, int userId);
    Task DeleteItemAsync(int listId, int itemId, int userId);
    Task<ShoppingList> ToggleFavoriteAsync(int id, int userId);
    Task<string> UploadItemImageAsync(int listId, int itemId, int userId, Stream fileStream, string fileName, string contentType);
    Task<List<string>> GetItemSuggestionsAsync(int userId, string query);
}
