using System.Security.Claims;
using MassagePlatform.WebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace MassagePlatform.WebApi.Tenancy;

public sealed class TenantResolutionMiddleware(
    PlatformDbContext platformDb,
    TenantScope tenantScope) : IMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        var path = context.Request.Path;
        if (path.StartsWithSegments("/api/platform") || path.StartsWithSegments("/api/health") ||
            path.StartsWithSegments("/openapi"))
        {
            await next(context);
            return;
        }

        var slug = context.Request.Headers["X-Tenant"].FirstOrDefault();
        if (string.IsNullOrWhiteSpace(slug))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            await context.Response.WriteAsJsonAsync(new { error = "The X-Tenant header is required." });
            return;
        }

        var tenant = await platformDb.Tenants.AsNoTracking()
            .SingleOrDefaultAsync(t => t.Slug == slug && t.IsActive, context.RequestAborted);
        if (tenant is null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant not found." });
            return;
        }

        var tokenTenantId = context.User.FindFirstValue("tenant_id");
        if (context.User.Identity?.IsAuthenticated == true &&
            !string.Equals(tokenTenantId, tenant.Id.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "The token does not belong to this tenant." });
            return;
        }

        tenantScope.Set(tenant.Id, tenant.DatabaseName);
        await next(context);
    }
}
