using MyShoppingApp.Domain.Entities;

namespace MyShoppingApp.Domain.Interfaces;

public interface ICurrencyRateRepository
{
    Task<List<CurrencyRate>> GetAllAsync();
    Task UpsertAsync(string currency, double rate);
}
