using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}")]
public class CurrencyController : ControllerBase
{
    private readonly ICurrencyService _service;

    public CurrencyController(ICurrencyService service)
    {
        _service = service;
    }

    [HttpGet("currency")]
    public async Task<IActionResult> GetRates()
    {
        try
        {
            var result = await _service.GetRatesAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Kurlar okunamadı" });
        }
    }

    [HttpPost("settings/currency")]
    [Authorize(Roles = "SUPER_ADMIN,CURRENCY_ADMIN")]
    public async Task<IActionResult> UpdateRates()
    {
        try
        {
            var result = await _service.UpdateRatesAsync();
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Döviz kurları güncellenemedi." });
        }
    }
}
