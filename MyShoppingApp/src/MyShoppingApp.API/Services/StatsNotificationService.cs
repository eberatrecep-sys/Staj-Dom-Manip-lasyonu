using Microsoft.AspNetCore.SignalR;
using MyShoppingApp.Application.Interfaces;
using MyShoppingApp.API.Hubs;

namespace MyShoppingApp.API.Services;

public class StatsNotificationService : IStatsNotificationService
{
    private readonly IHubContext<AdminStatsHub> _hubContext;

    public StatsNotificationService(IHubContext<AdminStatsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyStatsUpdatedAsync()
    {
        await _hubContext.Clients.All.SendAsync("StatsUpdated");
    }
}
