using Asp.Versioning;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs.ShoppingList;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/shopping-list")]
[Authorize]
public class ShoppingListController : ControllerBase
{
    private readonly IShoppingListService _service;

    public ShoppingListController(IShoppingListService service)
    {
        _service = service;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue("userId")!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var lists = await _service.GetAllByUserAsync(GetUserId());
        return Ok(lists);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var list = await _service.GetByIdAsync(id, GetUserId());
            return Ok(list);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz erişim" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateListDto dto)
    {
        var list = await _service.CreateAsync(dto, GetUserId());
        return Ok(list);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateListDto dto)
    {
        try
        {
            var list = await _service.UpdateAsync(id, dto, GetUserId());
            return Ok(list);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz işlem." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Liste güncellenemedi." });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await _service.DeleteAsync(id, GetUserId());
            return Ok(new { message = "Liste silindi." });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz işlem." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Liste silinemedi." });
        }
    }

    [HttpPut("{id}/favorite")]
    public async Task<IActionResult> ToggleFavorite(int id)
    {
        try
        {
            var list = await _service.ToggleFavoriteAsync(id, GetUserId());
            return Ok(list);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz erişim" });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }

    [HttpPost("{id}/items")]
    public async Task<IActionResult> AddItem(int id, [FromBody] CreateItemDto dto)
    {
        try
        {
            var item = await _service.AddItemAsync(id, dto, GetUserId());
            return Ok(item);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz erişim" });
        }
    }

    [HttpPut("{listId}/items/{itemId}")]
    public async Task<IActionResult> UpdateItem(int listId, int itemId, [FromBody] UpdateItemDto dto)
    {
        try
        {
            var item = await _service.UpdateItemAsync(listId, itemId, dto, GetUserId());
            return Ok(item);
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz işlem." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Ürün güncellenemedi." });
        }
    }

    [HttpDelete("{listId}/items/{itemId}")]
    public async Task<IActionResult> DeleteItem(int listId, int itemId)
    {
        try
        {
            await _service.DeleteItemAsync(listId, itemId, GetUserId());
            return Ok(new { message = "Ürün başarıyla silindi." });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz işlem." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Ürün silinemedi." });
        }
    }

    [HttpPost("{listId}/items/{itemId}/images")]
    [MyShoppingApp.API.Attributes.AllowedExtensions(new[] { ".jpg", ".jpeg", ".png" })]
    [MyShoppingApp.API.Attributes.MaxFileSize(5 * 1024 * 1024)] // 5MB
    public async Task<IActionResult> UploadItemImage(int listId, int itemId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { Message = "Lütfen bir dosya seçin." });

        try
        {
            var url = await _service.UploadItemImageAsync(listId, itemId, GetUserId(), file.OpenReadStream(), file.FileName, file.ContentType);
            return Ok(new { Url = url, Message = "Fotoğraf başarıyla eklendi." });
        }
        catch (UnauthorizedAccessException)
        {
            return StatusCode(403, new { error = "Yetkisiz işlem." });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("suggestions")]
    public async Task<IActionResult> GetSuggestions([FromQuery] string q)
    {
        var suggestions = await _service.GetItemSuggestionsAsync(GetUserId(), q);
        return Ok(suggestions);
    }
}
