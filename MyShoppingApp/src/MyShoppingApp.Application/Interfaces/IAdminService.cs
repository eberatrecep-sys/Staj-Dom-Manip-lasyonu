,using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Application.Interfaces;

public interface IAdminService
{
    Task<List<User>> GetDbViewAsync();
    Task<MessageResponseDto> UpdateRoleAsync(int targetUserId, string newRole);
}
