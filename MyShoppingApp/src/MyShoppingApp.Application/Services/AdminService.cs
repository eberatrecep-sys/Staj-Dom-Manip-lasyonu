using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;

    public AdminService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<User>> GetDbViewAsync()
    {
        return await _userRepository.GetAllWithListsAsync();
    }

    public async Task<MessageResponseDto> UpdateRoleAsync(int targetUserId, string newRole)
    {
        var user = await _userRepository.GetByIdAsync(targetUserId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");

        if (!Enum.TryParse<Role>(newRole, true, out var role))
            throw new InvalidOperationException("Geçersiz rol.");

        user.Role = role;
        await _userRepository.UpdateAsync(user);
        return new MessageResponseDto("Rol başarıyla güncellendi.");
    }
}
