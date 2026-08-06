using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;

namespace MyShoppingApp.Domain.Interfaces;

public interface IShareRepository
{
    Task<ListShareRequest> CreateAsync(ListShareRequest request);
    Task<List<ListShareRequest>> GetPendingRequestsByUserIdAsync(int userId);
    Task<ListShareRequest?> GetByIdAsync(int id);
    Task UpdateAsync(ListShareRequest request);
}
