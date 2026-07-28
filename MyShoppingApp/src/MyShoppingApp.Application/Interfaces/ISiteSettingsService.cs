using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.DTOs.Settings;

namespace MyShoppingApp.Application.Interfaces;

public interface ISiteSettingsService
{
    Task<SiteTitleResponseDto> GetTitleAsync();
    Task<MessageResponseDto> UpdateTitleAsync(string newTitle);
}
