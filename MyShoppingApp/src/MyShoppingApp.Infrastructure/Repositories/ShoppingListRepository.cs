using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class ShoppingListRepository : IShoppingListRepository
{
    private readonly AppDbContext _context;

    public ShoppingListRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ShoppingList>> GetAllByUserIdAsync(int userId)
    {
        return await _context.ShoppingLists
            .AsNoTracking()
            .Where(sl => sl.UserId == userId || sl.SharedWithUsers.Any(u => u.Id == userId))
            .Include(sl => sl.Items).ThenInclude(i => i.Images)
            .Include(sl => sl.SharedWithUsers)
            .AsSplitQuery()
            .OrderByDescending(sl => sl.UpdatedAt)
            .ToListAsync();
    }

    public async Task<ShoppingList?> GetByIdWithItemsAsync(int id)
    {
        return await _context.ShoppingLists
            .Include(sl => sl.Items).ThenInclude(i => i.Images)
            .Include(sl => sl.SharedWithUsers)
            .AsSplitQuery()
            .FirstOrDefaultAsync(sl => sl.Id == id);
    }

    public async Task<ShoppingList> CreateAsync(ShoppingList list)
    {
        _context.ShoppingLists.Add(list);
        await _context.SaveChangesAsync();
        return list;
    }

    public async Task UpdateAsync(ShoppingList list)
    {
        _context.ShoppingLists.Update(list);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(ShoppingList list)
    {
        _context.ShoppingLists.Remove(list);
        await _context.SaveChangesAsync();
    }

    public async Task<ShoppingListItem> AddItemAsync(ShoppingListItem item)
    {
        _context.ShoppingListItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<ShoppingListItem?> GetItemByIdAsync(int itemId)
    {
        return await _context.ShoppingListItems
            .Include(i => i.Images)
            .FirstOrDefaultAsync(i => i.Id == itemId);
    }

    public async Task UpdateItemAsync(ShoppingListItem item)
    {
        _context.ShoppingListItems.Update(item);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteItemAsync(ShoppingListItem item)
    {
        _context.ShoppingListItems.Remove(item);
        await _context.SaveChangesAsync();
    }

    public async Task<List<string>> GetItemSuggestionsAsync(int userId, string query)
    {
        var lowerQuery = query.ToLower();
        return await _context.ShoppingListItems
            .Include(i => i.List)
            .Where(i => (i.List.UserId == userId || i.List.SharedWithUsers.Any(u => u.Id == userId)) && i.ItemName.ToLower().Contains(lowerQuery))
            .Select(i => i.ItemName)
            .Distinct()
            .Take(10)
            .ToListAsync();
    }
}
