using MyShoppingApp.Application.DTOs.ShoppingList;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class ShoppingListService : IShoppingListService
{
    private readonly IShoppingListRepository _repository;

    public ShoppingListService(IShoppingListRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ShoppingList>> GetAllByUserAsync(int userId)
    {
        return await _repository.GetAllByUserIdAsync(userId);
    }

    public async Task<ShoppingList> GetByIdAsync(int id, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz erişim");

        return list;
    }

    public async Task<ShoppingList> CreateAsync(CreateListDto dto, int userId)
    {
        var list = new ShoppingList
        {
            Title = dto.Title ?? "New List",
            Category = dto.Category ?? "Recents",
            Tag = dto.Tag,
            UserId = userId
        };

        return await _repository.CreateAsync(list);
    }

    public async Task<ShoppingList> UpdateAsync(int id, UpdateListDto dto, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz işlem.");

        list.Tag = dto.Tag;
        list.UpdatedAt = DateTime.UtcNow;
        await _repository.UpdateAsync(list);
        return list;
    }

    public async Task DeleteAsync(int id, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(id)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz işlem.");

        await _repository.DeleteAsync(list);
    }

    public async Task<ShoppingListItem> AddItemAsync(int listId, CreateItemDto dto, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(listId)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz erişim");

        var item = new ShoppingListItem
        {
            ListId = listId,
            ItemName = dto.ItemName,
            Amount = dto.Amount
        };

        return await _repository.AddItemAsync(item);
    }

    public async Task<ShoppingListItem> UpdateItemAsync(int listId, int itemId, UpdateItemDto dto, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(listId)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz işlem.");

        var item = await _repository.GetItemByIdAsync(itemId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        if (dto.ItemName != null) item.ItemName = dto.ItemName;
        if (dto.Amount.HasValue) item.Amount = dto.Amount.Value;
        if (dto.IsCompleted.HasValue) item.IsCompleted = dto.IsCompleted.Value;

        await _repository.UpdateItemAsync(item);
        return item;
    }

    public async Task DeleteItemAsync(int listId, int itemId, int userId)
    {
        var list = await _repository.GetByIdWithItemsAsync(listId)
            ?? throw new KeyNotFoundException("Liste bulunamadı.");

        if (list.UserId != userId && !list.SharedWithUsers.Any(u => u.Id == userId))
            throw new UnauthorizedAccessException("Yetkisiz işlem.");

        var item = await _repository.GetItemByIdAsync(itemId)
            ?? throw new KeyNotFoundException("Ürün bulunamadı.");

        await _repository.DeleteItemAsync(item);
    }
}
