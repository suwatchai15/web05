using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize]
[Route("api/rooms")]
public sealed class RoomsController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public Task<List<Room>> List([FromQuery] Guid? branchId, CancellationToken ct)
    {
        var rooms = db.Rooms.AsNoTracking();
        if (branchId.HasValue) rooms = rooms.Where(x => x.BranchId == branchId);
        return rooms.OrderBy(x => x.Name).ToListAsync(ct);
    }

    [HttpPost]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Create(RoomRequest request, CancellationToken ct)
    {
        if (!await db.Branches.AnyAsync(x => x.Id == request.BranchId && x.IsActive, ct)) return BadRequest(new { error = "Active branch not found." });
        var room = new Room { BranchId = request.BranchId, Name = request.Name.Trim() };
        db.Rooms.Add(room);
        await db.SaveChangesAsync(ct);
        return Created($"/api/rooms/{room.Id}", room);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Update(Guid id, RoomRequest request, CancellationToken ct)
    {
        var room = await db.Rooms.FindAsync([id], ct);
        if (room is null) return NotFound();
        if (!await db.Branches.AnyAsync(x => x.Id == request.BranchId && x.IsActive, ct)) return BadRequest(new { error = "Active branch not found." });
        room.BranchId = request.BranchId; room.Name = request.Name.Trim();
        await db.SaveChangesAsync(ct);
        return Ok(room);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Owner,Manager")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var room = await db.Rooms.FindAsync([id], ct);
        if (room is null) return NotFound();
        room.IsActive = false;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public sealed record RoomRequest(Guid BranchId, [Required, StringLength(80, MinimumLength = 1)] string Name);
