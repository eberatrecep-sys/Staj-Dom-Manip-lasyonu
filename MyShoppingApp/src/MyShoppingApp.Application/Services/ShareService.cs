using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class ShareService : IShareService
{
    private readonly IShareRepository _shareRepository;
    private readonly IUserRepository _userRepository;
    private readonly IShoppingListRepository _shoppingListRepository;

    public ShareService(
        IShareRepository shareRepository,
        IUserRepository userRepository,
        IShoppingListRepository shoppingListRepository)
    {
        _shareRepository = shareRepository;
        _userRepository = userRepository;
        _shoppingListRepository = shoppingListRepository;
    }

    public async Task<ListShareRequest> InviteUserAsync(int listId, string targetEmail, int senderId)
    {
        var receiver = await _userRepository.GetByEmailAsync(targetEmail);
        if (receiver == null)
        {
            throw new Exception("Kullanıcı bulunamadı.");
        }

        if (receiver.Id == senderId)
        {
            throw new Exception("Kendinize istek gönderemezsiniz.");
        }

        var list = await _shoppingListRepository.GetByIdWithItemsAsync(listId);
        if (list == null || list.UserId != senderId)
        {
            throw new UnauthorizedAccessException("Bu listeyi paylaşma yetkiniz yok.");
        }

        var request = new ListShareRequest
        {
            ListId = listId,
            SenderId = senderId,
            ReceiverId = receiver.Id,
            Status = ShareRequestStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        return await _shareRepository.CreateAsync(request);
    }

    public async Task<List<ListShareRequest>> GetPendingRequestsAsync(int userId)
    {
        return await _shareRepository.GetPendingRequestsByUserIdAsync(userId);
    }

    public async Task AcceptRequestAsync(int requestId, int userId)
    {
        var request = await _shareRepository.GetByIdAsync(requestId);
        if (request == null || request.ReceiverId != userId)
        {
            throw new UnauthorizedAccessException("Geçersiz istek.");
        }

        if (request.Status != ShareRequestStatus.Pending)
        {
            throw new Exception("Bu istek zaten yanıtlanmış.");
        }

        var user = await _userRepository.GetByIdAsync(userId);
        if (user != null)
        {
            request.Status = ShareRequestStatus.Accepted;
            request.List.SharedWithUsers.Add(user);
            await _shareRepository.UpdateAsync(request);
        }
    }

    public async Task RejectRequestAsync(int requestId, int userId)
    {
        var request = await _shareRepository.GetByIdAsync(requestId);
        if (request == null || request.ReceiverId != userId)
        {
            throw new UnauthorizedAccessException("Geçersiz istek.");
        }

        if (request.Status != ShareRequestStatus.Pending)
        {
            throw new Exception("Bu istek zaten yanıtlanmış.");
        }

        request.Status = ShareRequestStatus.Rejected;
        await _shareRepository.UpdateAsync(request);
    }
}
