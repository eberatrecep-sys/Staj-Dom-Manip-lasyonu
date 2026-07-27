namespace MyShoppingApp.Application.DTOs.Currency;

public record CurrencyRatesResponseDto(Dictionary<string, double> Rates);
