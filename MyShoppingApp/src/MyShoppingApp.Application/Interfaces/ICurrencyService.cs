namespace MyShoppingApp.Application.Interfaces;

public interface ICurrencyService
{
    Task<object> GetRatesAsync();
    Task<object> UpdateRatesAsync();
}
