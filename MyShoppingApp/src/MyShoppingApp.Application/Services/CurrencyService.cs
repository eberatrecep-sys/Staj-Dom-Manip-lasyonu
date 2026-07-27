using System.Text.Json;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Interfaces;

namespace MyShoppingApp.Application.Services;

public class CurrencyService : ICurrencyService
{
    private readonly ICurrencyRateRepository _repository;
    private readonly HttpClient _httpClient;

    public CurrencyService(ICurrencyRateRepository repository, HttpClient httpClient)
    {
        _repository = repository;
        _httpClient = httpClient;
    }

    public async Task<object> GetRatesAsync()
    {
        var rates = await _repository.GetAllAsync();

        if (rates.Count == 0)
            return new { rates = new { USD = 0.0, EUR = 0.0, GBP = 0.0 } };

        var ratesObj = new Dictionary<string, double>();
        foreach (var r in rates)
            ratesObj[r.Currency] = r.Rate;

        return new { rates = ratesObj };
    }

    public async Task<object> UpdateRatesAsync()
    {
        var response = await _httpClient.GetStringAsync("https://api.frankfurter.dev/v1/latest?base=TRY");
        var data = JsonSerializer.Deserialize<JsonElement>(response);
        var ratesElement = data.GetProperty("rates");

        foreach (var prop in ratesElement.EnumerateObject())
        {
            var currency = prop.Name;
            var rateVal = prop.Value.GetDouble();
            if (rateVal > 0)
            {
                var finalRate = Math.Round(1.0 / rateVal, 4);
                await _repository.UpsertAsync(currency, finalRate);
            }
        }

        return new { message = "Döviz kurları başarıyla güncellendi!" };
    }
}
