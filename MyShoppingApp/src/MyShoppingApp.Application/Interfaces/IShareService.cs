using MyShoppingApp.Application.DTOs.ShoppingList;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Application.Interfaces;

public interface IShareService
{
    Task<ListShareRequest> InviteUserAsync(int listId, string targetEmail, int senderId);
    Task<List<ListShareRequest>> GetPendingRequestsAsync(int userId);
    Task AcceptRequestAsync(int requestId, int userId);
    Task RejectRequestAsync(int requestId, int userId);
}
