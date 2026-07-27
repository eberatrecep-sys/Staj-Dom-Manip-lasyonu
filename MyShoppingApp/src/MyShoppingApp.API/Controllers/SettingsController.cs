using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[Route("api/settings")]
public class SettingsController : ControllerBase
{
    private readonly ISiteSettingsService _service;

    public SettingsController(ISiteSettingsService service)
    {
        _service = service;
    }

    [HttpGet("title")]
    public async Task<IActionResult> GetTitle()
    {
        var result = await _service.GetTitleAsync();
        return Ok(result);
    }

    [HttpPut("title")]
    [Authorize(Roles = "SUPER_ADMIN,CONTENT_ADMIN")]
    public async Task<IActionResult> UpdateTitle([FromBody] UpdateTitleRequest request)
    {
        try
        {
            var result = await _service.UpdateTitleAsync(request.NewTitle);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Başlık güncellenemedi." });
        }
    }
}

public record UpdateTitleRequest(string NewTitle);
