using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByResetTokenAsync(string token);
    Task<List<User>> GetAllWithListsAsync();
    Task<User> CreateAsync(User user);
    Task UpdateAsync(User user);
}
