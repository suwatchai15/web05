using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize]
[Route("api/staff")]
public sealed class StaffController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<StaffMember>> List(CancellationToken ct) => db.Staff.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);

    [HttpPost]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Create(StaffRequest request, CancellationToken ct)
    {
        if (!await db.Branches.AnyAsync(x => x.Id == request.BranchId && x.IsActive, ct)) return BadRequest(new { error = "Active branch not found." });
        var staff = new StaffMember { BranchId = request.BranchId, Name = request.Name.Trim(), Email = request.Email?.Trim() };
        db.Staff.Add(staff);
        await db.SaveChangesAsync(ct);
        return Created($"/api/staff/{staff.Id}", staff);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Update(Guid id, StaffRequest request, CancellationToken ct)
    {
        var staff = await db.Staff.FindAsync([id], ct);
        if (staff is null) return NotFound();
        if (!await db.Branches.AnyAsync(x => x.Id == request.BranchId && x.IsActive, ct)) return BadRequest(new { error = "Active branch not found." });
        staff.BranchId = request.BranchId; staff.Name = request.Name.Trim(); staff.Email = request.Email?.Trim();
        await db.SaveChangesAsync(ct);
        return Ok(staff);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var staff = await db.Staff.FindAsync([id], ct);
        if (staff is null) return NotFound();
        staff.IsActive = false;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public sealed record StaffRequest(Guid BranchId, [Required, StringLength(160, MinimumLength = 1)] string Name,
    [EmailAddress, StringLength(254)] string? Email);
