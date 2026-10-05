using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(TenantDbContext db, MassagePlatform.WebApi.Tenancy.TenantScope tenantScope,
    TokenService tokens) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Login(TenantLoginRequest request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == email && u.IsActive, cancellationToken);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)) return Unauthorized();
        return Ok(new TokenResponse(tokens.CreateTenantToken(tenantScope.TenantId!.Value, user.Id, user.Email, user.Role)));
    }

    [HttpGet("me")]
    [Authorize]
    public ActionResult<UserResponse> Me() => Ok(new UserResponse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)!,
        User.FindFirstValue(ClaimTypes.Email)!,
        User.FindFirstValue(ClaimTypes.Role)!));
}

public sealed record TenantLoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public sealed record UserResponse(string Id, string Email, string Role);
