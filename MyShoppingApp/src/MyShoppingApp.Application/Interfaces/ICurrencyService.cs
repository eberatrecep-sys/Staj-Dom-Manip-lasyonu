using MyShoppingApp.Application.DTOs.Common;
using MyShoppingApp.Application.DTOs.Currency;

namespace MyShoppingApp.Application.Interfaces;

public interface ICurrencyService
{
    Task<CurrencyRatesResponseDto> GetRatesAsync();
    Task<MessageResponseDto> UpdateRatesAsync();
}
