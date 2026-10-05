using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize]
[Route("api/branches")]
public sealed class BranchesController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<Branch>> List(CancellationToken ct) => db.Branches.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);

    [HttpPost]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Create(BranchRequest request, CancellationToken ct)
    {
        var branch = new Branch { Name = request.Name.Trim(), Address = request.Address, TimeZone = request.TimeZone };
        db.Branches.Add(branch);
        await db.SaveChangesAsync(ct);
        return Created($"/api/branches/{branch.Id}", branch);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Update(Guid id, BranchRequest request, CancellationToken ct)
    {
        var branch = await db.Branches.FindAsync([id], ct);
        if (branch is null) return NotFound();
        branch.Name = request.Name.Trim(); branch.Address = request.Address; branch.TimeZone = request.TimeZone;
        await db.SaveChangesAsync(ct);
        return Ok(branch);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var branch = await db.Branches.FindAsync([id], ct);
        if (branch is null) return NotFound();
        db.Branches.Remove(branch);
        try { await db.SaveChangesAsync(ct); return NoContent(); }
        catch (DbUpdateException) { return Conflict(new { error = "Branch is in use." }); }
    }
}

public sealed record BranchRequest([Required, StringLength(160, MinimumLength = 1)] string Name,
    [StringLength(500)] string? Address, [Required, StringLength(100)] string TimeZone = "UTC");
