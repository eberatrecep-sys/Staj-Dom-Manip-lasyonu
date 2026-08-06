using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MyShoppingApp.Application.DTOs.Admin;
using MyShoppingApp.Application.Interfaces;

namespace MyShoppingApp.API.Controllers;

// [ApiController]: Bu denetleyicinin (Controller) RESTful HTTP isteklerine cevap vereceğini belirtir.
[ApiController]
// [Route]: API isteklerinin yönlendirileceği genel URL şablonunu belirler ("api/admin").
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
// [Authorize]: Bu denetleyici içindeki tüm işlemlere erişmek için kullanıcının sisteme giriş yapmış olması (JWT taşıması) gerektiğini zorunlu kılar.
[Authorize]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    // [HttpGet("db-view")]: GET metoduyla "api/admin/db-view" uç noktasına gelen istekleri dinler.
    // [Authorize(Roles = "SUPER_ADMIN")]: Sadece sisteme giriş yapmış olan VE rolü "SUPER_ADMIN" olan kullanıcıların bu uç noktayı çağırabilmesini sağlar.
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
    [EnableRateLimiting("WriteLimit")]
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

    [HttpDelete("users/{id}")]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var result = await _adminService.DeleteUserAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Kullanıcı silinemedi." });
        }
    }

    [HttpGet("stats")]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<IActionResult> GetSystemStats()
    {
        try
        {
            var stats = await _adminService.GetSystemStatsAsync();
            return Ok(stats);
        }
        catch (Exception)
        {
            return StatusCode(500, new { error = "Sistem istatistikleri okunamadı." });
        }
    }
}
