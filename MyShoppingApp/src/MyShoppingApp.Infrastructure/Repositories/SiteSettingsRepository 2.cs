using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class SiteSettingsRepository : ISiteSettingsRepository
{
    private readonly AppDbContext _context;

    public SiteSettingsRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SiteSettings?> GetFirstAsync()
    {
        return await _context.SiteSettings.FirstOrDefaultAsync();
    }

    public async Task<SiteSettings> CreateAsync(SiteSettings settings)
    {
        _context.SiteSettings.Add(settings);
        await _context.SaveChangesAsync();
        return settings;
    }

    public async Task UpdateAsync(SiteSettings settings)
    {
        _context.SiteSettings.Update(settings);
        await _context.SaveChangesAsync();
    }
}
