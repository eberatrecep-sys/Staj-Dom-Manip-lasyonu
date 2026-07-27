namespace MyShoppingApp.Application.Interfaces;

public interface IAdminService
{
    Task<object> GetDbViewAsync();
    Task<object> UpdateRoleAsync(int targetUserId, string newRole);
}
