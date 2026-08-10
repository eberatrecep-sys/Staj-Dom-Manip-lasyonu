using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class OfferRepository : IOfferRepository
{
    private readonly AppDbContext _context;
    private readonly IStatsNotificationService _statsNotificationService;

    public OfferRepository(AppDbContext context, IStatsNotificationService statsNotificationService)
    {
        _context = context;
        _statsNotificationService = statsNotificationService;
    }

    public async Task<Offer?> GetByIdAsync(int id)
    {
        return await _context.Offers.FindAsync(id);
    }

    public async Task<IEnumerable<Offer>> GetAllAsync()
    {
        return await _context.Offers
            .OrderBy(o => o.DisplayOrder)
            .ToListAsync();
    }

    public async Task<IEnumerable<Offer>> GetActiveOffersAsync()
    {
        return await _context.Offers
            .AsNoTracking()
            .Where(o => o.IsActive)
            .OrderBy(o => o.DisplayOrder)
            .ToListAsync();
    }

    public async Task<Offer> AddAsync(Offer offer)
    {
        await _context.Offers.AddAsync(offer);
        await _context.SaveChangesAsync();
        await _statsNotificationService.NotifyStatsUpdatedAsync();
        return offer;
    }

    public async Task UpdateAsync(Offer offer)
    {
        _context.Offers.Update(offer);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Offer offer)
    {
        _context.Offers.Remove(offer);
        await _context.SaveChangesAsync();
        await _statsNotificationService.NotifyStatsUpdatedAsync();
    }
}
