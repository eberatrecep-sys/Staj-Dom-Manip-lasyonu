using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IOfferRepository _offerRepository;

    public AdminService(IUserRepository userRepository, IFileStorageService fileStorageService, IOfferRepository offerRepository)
    {
        _userRepository = userRepository;
        _fileStorageService = fileStorageService;
        _offerRepository = offerRepository;
    }

    public async Task<List<User>> GetDbViewAsync()
    {
        var users = await _userRepository.GetAllWithListsAsync();
        foreach (var user in users)
        {
            if (!string.IsNullOrEmpty(user.ProfilePictureUrl))
            {
                user.ProfilePictureUrl = _fileStorageService.GenerateSignedUrl(user.ProfilePictureUrl, TimeSpan.FromHours(1));
            }
        }
        return users;
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

    public async Task<MessageResponseDto> DeleteUserAsync(int targetUserId)
    {
        var user = await _userRepository.GetByIdAsync(targetUserId)
            ?? throw new KeyNotFoundException("Kullanıcı bulunamadı.");
            
        // Soft delete logic
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        
        await _userRepository.UpdateAsync(user);
        return new MessageResponseDto("Kullanıcı başarıyla silindi (soft delete).");
    }

    public async Task<MyShoppingApp.Application.DTOs.Admin.SystemStatsDto> GetSystemStatsAsync()
    {
        var allUsers = await _userRepository.GetAllWithListsAsync();
        var totalUsers = allUsers.Count;
        var activeUsers = allUsers.Count(u => !u.IsDeleted);

        var activeOffers = await _offerRepository.GetActiveOffersAsync();
        var activeOffersCount = activeOffers.Count();

        return new MyShoppingApp.Application.DTOs.Admin.SystemStatsDto
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            ActiveOffers = activeOffersCount
        };
    }
}
