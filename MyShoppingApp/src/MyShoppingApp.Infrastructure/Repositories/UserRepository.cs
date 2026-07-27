using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User?> GetByResetTokenAsync(string token)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.ResetToken == token);
    }

    public async Task<List<User>> GetAllWithListsAsync()
    {
        return await _context.Users
            .Include(u => u.ShoppingLists)
                .ThenInclude(sl => sl.Items)
            .ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }
}
