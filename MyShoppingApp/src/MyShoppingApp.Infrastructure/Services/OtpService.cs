using Microsoft.Extensions.Caching.Distributed;
using MyShoppingApp.Application.Interfaces;
using System;
using System.Threading.Tasks;

namespace MyShoppingApp.Infrastructure.Services;

public class OtpService : IOtpService
{
    private readonly IDistributedCache _cache;
    private readonly TimeSpan _expiry = TimeSpan.FromMinutes(3); // 3 minute expiry

    public OtpService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<string> GenerateOtpAsync(string email, string purpose)
    {
        // Generate a 6-digit random code
        var random = new Random();
        var otp = random.Next(100000, 999999).ToString();

        var cacheKey = $"otp:{purpose}:{email}";
        
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = _expiry
        };

        await _cache.SetStringAsync(cacheKey, otp, options);

        return otp;
    }

    public async Task<bool> ValidateOtpAsync(string email, string otp, string purpose)
    {
        var cacheKey = $"otp:{purpose}:{email}";
        var storedOtp = await _cache.GetStringAsync(cacheKey);

        if (storedOtp == null)
            return false;

        if (storedOtp == otp)
        {
            // Invalidate the OTP after successful use
            await _cache.RemoveAsync(cacheKey);
            return true;
        }

        return false;
    }
}
