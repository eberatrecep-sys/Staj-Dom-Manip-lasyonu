using Asp.Versioning;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs.Share;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/share")]
[Authorize]
public class ShareController : ControllerBase
{
    private readonly IShareService _shareService;

    public ShareController(IShareService shareService)
    {
        _shareService = shareService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue("userId")!);

    [HttpPost("invite")]
    public async Task<IActionResult> InviteUser([FromBody] InviteUserDto dto)
    {
        try
        {
            var request = await _shareService.InviteUserAsync(dto.ListId, dto.TargetEmail, GetUserId());
            return Ok(new { message = "Davet gönderildi.", requestId = request.Id });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var requests = await _shareService.GetPendingRequestsAsync(GetUserId());
        var result = requests.Select(r => new
        {
            r.Id,
            r.ListId,
            ListName = r.List.Title,
            SenderName = r.Sender.Email, // Email'i isim olarak gösteriyoruz
            r.CreatedAt
        });
        return Ok(result);
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptRequest(int id)
    {
        try
        {
            await _shareService.AcceptRequestAsync(id, GetUserId());
            return Ok(new { message = "Davet kabul edildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectRequest(int id)
    {
        try
        {
            await _shareService.RejectRequestAsync(id, GetUserId());
            return Ok(new { message = "Davet reddedildi." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
