using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace MyShoppingApp.API.Hubs;

[Authorize(Roles = "SUPER_ADMIN")]
public class AdminStatsHub : Hub
{
    // Adminlerin bağlandığında veya koptuğunda loglama yapılabilir.
    public override async Task OnConnectedAsync()
    {
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
