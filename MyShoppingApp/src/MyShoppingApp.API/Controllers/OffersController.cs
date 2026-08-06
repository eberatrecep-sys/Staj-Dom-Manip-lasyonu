using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;

    public OffersController(IOfferService offerService)
    {
        _offerService = offerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveOffers()
    {
        var offers = await _offerService.GetActiveOffersAsync();
        return Ok(offers);
    }
}
