using System.Threading.Tasks;

namespace MyShoppingApp.Application.Interfaces;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string email, string purpose);
    Task<bool> ValidateOtpAsync(string email, string otp, string purpose);
}
