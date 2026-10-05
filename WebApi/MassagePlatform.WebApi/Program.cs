using System.Text;
using MassagePlatform.WebApi.Controllers;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Security;
using MassagePlatform.WebApi.Services;
using MassagePlatform.WebApi.Tenancy;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var platformConnection = Required(builder.Configuration, "ConnectionStrings:Platform");
Required(builder.Configuration, "TenantDatabase:AdminConnectionString");
var signingKey = Required(builder.Configuration, "Jwt:SigningKey");
var issuer = Required(builder.Configuration, "Jwt:Issuer");
var audience = Required(builder.Configuration, "Jwt:Audience");
Required(builder.Configuration, "Platform:AdminUsername");
Required(builder.Configuration, "Platform:AdminPasswordHash");
if (Encoding.UTF8.GetByteCount(signingKey) < 32)
    throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 UTF-8 bytes.");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<PlatformDbContext>(options => options.UseNpgsql(platformConnection));
builder.Services.AddDbContext<TenantDbContext>((services, options) =>
{
    var scope = services.GetRequiredService<TenantScope>();
    if (scope.DatabaseName is null)
        throw new InvalidOperationException("Tenant database requested before tenant resolution.");
    var database = services.GetRequiredService<TenantDatabase>();
    options.UseNpgsql(database.ConnectionString(scope.DatabaseName));
});
builder.Services.AddScoped<TenantScope>();
builder.Services.AddSingleton<TenantDatabase>();
builder.Services.AddScoped<TenantResolutionMiddleware>();
builder.Services.AddScoped<TenantProvisioner>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IPasswordHasher<PlatformCredential>, PasswordHasher<PlatformCredential>>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = issuer,
        ValidateAudience = true, ValidAudience = audience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
        ValidateLifetime = true, ClockSkew = TimeSpan.FromSeconds(30),
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
        NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();

await using (var scope = app.Services.CreateAsyncScope())
{
    var platformDb = scope.ServiceProvider.GetRequiredService<PlatformDbContext>();
    await platformDb.Database.MigrateAsync();
    var tenantDatabase = scope.ServiceProvider.GetRequiredService<TenantDatabase>();
    var tenants = await platformDb.Tenants.AsNoTracking().Where(t => t.IsActive).ToListAsync();
    foreach (var tenant in tenants)
    {
        var options = new DbContextOptionsBuilder<TenantDbContext>()
            .UseNpgsql(tenantDatabase.ConnectionString(tenant.DatabaseName)).Options;
        await using var tenantDb = new TenantDbContext(options);
        await tenantDb.Database.MigrateAsync();
    }
}

if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.UseAuthentication();
app.UseMiddleware<TenantResolutionMiddleware>();
app.UseAuthorization();
app.MapControllers();
app.Run();

static string Required(IConfiguration configuration, string key)
{
    var value = configuration[key];
    if (string.IsNullOrWhiteSpace(value))
        throw new InvalidOperationException($"Missing required configuration: {key}");
    return value;
}

public partial class Program;
