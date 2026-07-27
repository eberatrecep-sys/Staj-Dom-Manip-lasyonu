using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MyShoppingApp.Application.DTOs.Admin;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("db-view")]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<IActionResult> GetDbView()
    {
        try
        {
            var data = await _adminService.GetDbViewAsync();
            return Ok(data);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Veritabanı okunamadı." });
        }
    }

    [HttpPut("role")]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<IActionResult> UpdateRole([FromBody] UpdateRoleDto dto)
    {
        try
        {
            var result = await _adminService.UpdateRoleAsync(dto.TargetUserId, dto.NewRole);
            return Ok(result);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Rol güncellenemedi." });
        }
    }
}
