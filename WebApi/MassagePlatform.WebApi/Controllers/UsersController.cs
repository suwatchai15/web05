using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using MassagePlatform.WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController, Authorize(Roles = "Owner,Manager")]
[Route("api/users")]
public sealed class UsersController(TenantDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TenantUserResponse>>> List(CancellationToken ct) =>
        Ok(await db.Users.AsNoTracking().OrderBy(x => x.Email)
            .Select(x => new TenantUserResponse(x.Id, x.Email, x.Role, x.IsActive)).ToListAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create(CreateTenantUserRequest request, CancellationToken ct)
    {
        if (request.Role is not ("Manager" or "Staff"))
            return BadRequest(new { error = "Role must be Manager or Staff. Owner accounts are provisioned by the platform." });
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Email == email, ct)) return Conflict(new { error = "Email is already in use." });
        var user = new TenantUser
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);
        return Created($"/api/users/{user.Id}", new TenantUserResponse(user.Id, user.Email, user.Role, user.IsActive));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateTenantUserRequest request, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();
        var isOwner = user.Role == "Owner";
        if (isOwner && !User.IsInRole("Owner")) return Forbid();
        if (isOwner && request.Role != "Owner")
            return BadRequest(new { error = "The owner role cannot be changed here." });
        if (!isOwner && request.Role is not ("Manager" or "Staff"))
            return BadRequest(new { error = "Role must be Manager or Staff. Owner accounts are provisioned by the platform." });
        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId)
            && currentUserId == id && request.Role != user.Role)
            return Conflict(new { error = "You cannot change your own role." });

        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(x => x.Id != id && x.Email == email, ct))
            return Conflict(new { error = "Email is already in use." });

        user.Email = email;
        user.Role = request.Role;
        if (!string.IsNullOrWhiteSpace(request.Password))
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        await db.SaveChangesAsync(ct);
        return Ok(new TenantUserResponse(user.Id, user.Email, user.Role, user.IsActive));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();
        if (user.Role == "Owner") return Conflict(new { error = "Owner accounts cannot be deleted here." });
        if (Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var currentUserId) && currentUserId == id)
            return Conflict(new { error = "You cannot delete your own account." });

        db.Users.Remove(user);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPatch("{id:guid}/active")]
    public async Task<IActionResult> SetActive(Guid id, SetActiveRequest request, CancellationToken ct)
    {
        var user = await db.Users.FindAsync([id], ct);
        if (user is null) return NotFound();
        user.IsActive = request.IsActive;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}

public sealed record CreateTenantUserRequest([Required, EmailAddress, StringLength(254)] string Email,
    [Required, MinLength(12)] string Password, [Required] string Role);
public sealed record UpdateTenantUserRequest([Required, EmailAddress, StringLength(254)] string Email,
    [Required] string Role, [MinLength(12)] string? Password = null);
public sealed record SetActiveRequest(bool IsActive);
public sealed record TenantUserResponse(Guid Id, string Email, string Role, bool IsActive);
