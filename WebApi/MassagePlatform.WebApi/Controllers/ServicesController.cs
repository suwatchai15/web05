using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize]
[Route("api/services")]
public sealed class ServicesController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<MassageService>> List(CancellationToken ct) => db.Services.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);

    [HttpPost]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Create(ServiceRequest request, CancellationToken ct)
    {
        var service = new MassageService { Name = request.Name.Trim(), DurationMinutes = request.DurationMinutes, Price = request.Price };
        db.Services.Add(service);
        await db.SaveChangesAsync(ct);
        return Created($"/api/services/{service.Id}", service);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Update(Guid id, ServiceRequest request, CancellationToken ct)
    {
        var service = await db.Services.FindAsync([id], ct);
        if (service is null) return NotFound();
        service.Name = request.Name.Trim(); service.DurationMinutes = request.DurationMinutes; service.Price = request.Price;
        await db.SaveChangesAsync(ct);
        return Ok(service);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var service = await db.Services.FindAsync([id], ct);
        if (service is null) return NotFound();
        db.Services.Remove(service);
        try { await db.SaveChangesAsync(ct); return NoContent(); }
        catch (DbUpdateException) { return Conflict(new { error = "Service is in use." }); }
    }
}

public sealed record ServiceRequest([Required, StringLength(160, MinimumLength = 1)] string Name,
    [Range(5, 1440)] int DurationMinutes, [Range(typeof(decimal), "0", "99999999")] decimal Price);
