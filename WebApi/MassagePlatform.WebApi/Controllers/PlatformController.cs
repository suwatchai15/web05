using System.ComponentModel.DataAnnotations;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Security;
using MassagePlatform.WebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Controllers;

[ApiController]
[Route("api/platform")]
public sealed class PlatformController(
    IConfiguration configuration,
    TokenService tokens,
    TenantProvisioner provisioner,
    PlatformDbContext platformDb,
    IPasswordHasher<PlatformCredential> passwordHasher) : ControllerBase
{
    [HttpPost("auth/login")]
    [AllowAnonymous]
    public ActionResult<TokenResponse> Login(PlatformLoginRequest request)
    {
        var username = configuration["Platform:AdminUsername"];
        var hash = configuration["Platform:AdminPasswordHash"];
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(hash))
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "Platform admin credentials are not configured." });
        if (!string.Equals(username, request.Username, StringComparison.Ordinal) ||
            passwordHasher.VerifyHashedPassword(new PlatformCredential(), hash, request.Password) == PasswordVerificationResult.Failed)
            return Unauthorized();
        return Ok(new TokenResponse(tokens.CreatePlatformToken(username)));
    }

    [HttpPost("tenants")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<IActionResult> CreateTenant(CreateTenantRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var tenant = await provisioner.ProvisionAsync(request.Name, request.Slug, request.OwnerEmail,
                request.OwnerPassword, cancellationToken);
            return Created($"/api/platform/tenants/{tenant.Id}", new TenantResponse(tenant.Id, tenant.Name, tenant.Slug, tenant.IsActive));
        }
        catch (ArgumentException exception) { return BadRequest(new { error = exception.Message }); }
        catch (InvalidOperationException exception) { return Conflict(new { error = exception.Message }); }
    }

    [HttpGet("tenants")]
    [Authorize(Roles = "PlatformAdmin")]
    public async Task<ActionResult<IReadOnlyList<TenantResponse>>> ListTenants(CancellationToken cancellationToken)
    {
        var tenants = await platformDb.Tenants.OrderBy(t => t.Name)
            .Select(t => new TenantResponse(t.Id, t.Name, t.Slug, t.IsActive))
            .ToListAsync(cancellationToken);
        return Ok(tenants);
    }
}

public sealed class PlatformCredential { }
public sealed record PlatformLoginRequest([Required] string Username, [Required] string Password);
public sealed record CreateTenantRequest([Required, StringLength(160, MinimumLength = 2)] string Name,
    [Required, StringLength(63)] string Slug, [Required, EmailAddress, StringLength(254)] string OwnerEmail,
    [Required, MinLength(12)] string OwnerPassword);
public sealed record TenantResponse(Guid Id, string Name, string Slug, bool IsActive);
public sealed record TokenResponse(string AccessToken);
