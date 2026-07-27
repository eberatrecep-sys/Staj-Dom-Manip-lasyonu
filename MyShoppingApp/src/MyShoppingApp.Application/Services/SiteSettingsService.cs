using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class SiteSettingsService : ISiteSettingsService
{
    private readonly ISiteSettingsRepository _repository;

    public SiteSettingsService(ISiteSettingsRepository repository)
    {
        _repository = repository;
    }

    public async Task<object> GetTitleAsync()
    {
        var settings = await _repository.GetFirstAsync();
        if (settings == null)
        {
            settings = await _repository.CreateAsync(new SiteSettings { HomepageTitle = "Alışveriş Uygulaması" });
        }
        return new { title = settings.HomepageTitle };
    }

    public async Task<object> UpdateTitleAsync(string newTitle)
    {
        var settings = await _repository.GetFirstAsync();
        if (settings != null)
        {
            settings.HomepageTitle = newTitle;
            await _repository.UpdateAsync(settings);
        }
        return new { message = "Başlık güncellendi" };
    }
}
