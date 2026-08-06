using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace MyShoppingApp.Application.DTOs;

public class CreateOfferDto
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    public string? DiscountBadge { get; set; }

    public IFormFile? Image { get; set; }

    [Required]
    public string TargetUrl { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public int DisplayOrder { get; set; }
}
