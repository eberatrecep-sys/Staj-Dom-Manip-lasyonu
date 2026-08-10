using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/offers")]
[Authorize(Roles = "SUPER_ADMIN")]
public class AdminOffersController : ControllerBase
{
    private readonly IOfferService _offerService;

    public AdminOffersController(IOfferService offerService)
    {
        _offerService = offerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var offers = await _offerService.GetAllOffersAsync();
        return Ok(offers);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var offer = await _offerService.GetOfferByIdAsync(id);
        return Ok(offer);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] CreateOfferDto dto)
    {
        var created = await _offerService.CreateOfferAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromForm] UpdateOfferDto dto)
    {
        await _offerService.UpdateOfferAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _offerService.DeleteOfferAsync(id);
        return NoContent();
    }

    [HttpPost("send-bulk-email")]
    public async Task<IActionResult> SendBulkEmail([FromBody] BulkEmailRequestDto request)
    {
        if (request.OfferIds == null || !request.OfferIds.Any())
            return BadRequest(new { error = "En az bir kampanya seçilmelidir." });

        try 
        {
            var result = await _offerService.SendBulkEmailAsync(request.OfferIds);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Toplu mail gönderimi başarısız oldu: " + ex.Message });
        }
    }
}

public record BulkEmailRequestDto(List<int> OfferIds);
