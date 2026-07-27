using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class CurrencyRateRepository : ICurrencyRateRepository
{
    private readonly AppDbContext _context;

    public CurrencyRateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<CurrencyRate>> GetAllAsync()
    {
        return await _context.CurrencyRates.ToListAsync();
    }

    public async Task UpsertAsync(string currency, double rate)
    {
        var existing = await _context.CurrencyRates
            .FirstOrDefaultAsync(c => c.Currency == currency);

        if (existing != null)
        {
            existing.Rate = rate;
            existing.UpdatedAt = DateTime.UtcNow;
            _context.CurrencyRates.Update(existing);
        }
        else
        {
            _context.CurrencyRates.Add(new CurrencyRate
            {
                Currency = currency,
                Rate = rate,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
    }
}
