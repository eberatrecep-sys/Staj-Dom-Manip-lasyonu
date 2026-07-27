namespace MyShoppingApp.Application.Interfaces;

public interface ISiteSettingsService
{
    Task<object> GetTitleAsync();
    Task<object> UpdateTitleAsync(string newTitle);
}
