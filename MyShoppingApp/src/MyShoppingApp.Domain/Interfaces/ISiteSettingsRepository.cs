using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Domain.Interfaces;

public interface ISiteSettingsRepository
{
    Task<SiteSettings?> GetFirstAsync();
    Task<SiteSettings> CreateAsync(SiteSettings settings);
    Task UpdateAsync(SiteSettings settings);
}
