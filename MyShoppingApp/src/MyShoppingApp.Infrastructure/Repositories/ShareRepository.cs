using Microsoft.EntityFrameworkCore;
using MyShoppingApp.Domain.Entities;
using MyShoppingApp.Domain.Enums;
using MyShoppingApp.Domain.Interfaces;
using MyShoppingApp.Infrastructure.Context;

namespace MyShoppingApp.Infrastructure.Repositories;

public class ShareRepository : IShareRepository
{
    private readonly AppDbContext _context;

    public ShareRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ListShareRequest> CreateAsync(ListShareRequest request)
    {
        _context.ListShareRequests.Add(request);
        await _context.SaveChangesAsync();
        return request;
    }

    public async Task<List<ListShareRequest>> GetPendingRequestsByUserIdAsync(int userId)
    {
        return await _context.ListShareRequests
            .Include(r => r.Sender)
            .Include(r => r.List)
            .Where(r => r.ReceiverId == userId && r.Status == ShareRequestStatus.Pending)
            .ToListAsync();
    }

    public async Task<ListShareRequest?> GetByIdAsync(int id)
    {
        return await _context.ListShareRequests
            .Include(r => r.List)
                .ThenInclude(l => l.SharedWithUsers)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task UpdateAsync(ListShareRequest request)
    {
        _context.ListShareRequests.Update(request);
        await _context.SaveChangesAsync();
    }
}
