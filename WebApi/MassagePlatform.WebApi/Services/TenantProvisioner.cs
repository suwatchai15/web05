using System.Text.RegularExpressions;
using MassagePlatform.WebApi.Data;
using MassagePlatform.WebApi.Tenancy;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MassagePlatform.WebApi.Services;

public sealed class TenantProvisioner(
    PlatformDbContext platformDb,
    TenantDatabase tenantDatabase,
    ILogger<TenantProvisioner> logger)
{
    private static readonly Regex SlugPattern = new("^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$", RegexOptions.Compiled);

    public static bool IsValidSlug(string slug) => SlugPattern.IsMatch(slug);

    public async Task<PlatformTenant> ProvisionAsync(string name, string slug, string ownerEmail, string ownerPassword,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Tenant name is required.");
        if (!IsValidSlug(slug)) throw new ArgumentException("Slug must be 1-63 lowercase letters, digits, or hyphens and may not start or end with a hyphen.");
        if (await platformDb.Tenants.AnyAsync(t => t.Slug == slug, cancellationToken))
            throw new InvalidOperationException("A tenant with this slug already exists.");

        var databaseSuffix = Guid.NewGuid().ToString("N")[..16];
        var databaseSlug = slug.Replace('-', '_');
        if (databaseSlug.Length > 37) databaseSlug = databaseSlug[..37];
        var tenant = new PlatformTenant
        {
            Name = name.Trim(),
            Slug = slug,
            DatabaseName = $"massage_{databaseSlug}_{databaseSuffix}"
        };

        await CreateDatabaseAsync(tenant.DatabaseName, cancellationToken);
        try
        {
            var options = new DbContextOptionsBuilder<TenantDbContext>()
                .UseNpgsql(tenantDatabase.ConnectionString(tenant.DatabaseName)).Options;
            await using (var tenantDb = new TenantDbContext(options))
            {
                await tenantDb.Database.MigrateAsync(cancellationToken);
                tenantDb.Users.Add(new TenantUser
                {
                    Email = ownerEmail.Trim().ToLowerInvariant(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(ownerPassword),
                    Role = "Owner"
                });
                await tenantDb.SaveChangesAsync(cancellationToken);
            }
            platformDb.Tenants.Add(tenant);
            await platformDb.SaveChangesAsync(cancellationToken);
            return tenant;
        }
        catch
        {
            await DropDatabaseAsync(tenant.DatabaseName, cancellationToken);
            throw;
        }
    }

    private async Task CreateDatabaseAsync(string databaseName, CancellationToken cancellationToken)
    {
        await using var connection = new NpgsqlConnection(tenantDatabase.AdminConnectionString());
        await connection.OpenAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = $"CREATE DATABASE \"{databaseName}\"";
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private async Task DropDatabaseAsync(string databaseName, CancellationToken cancellationToken)
    {
        try
        {
            var builder = new NpgsqlConnectionStringBuilder(tenantDatabase.AdminConnectionString());
            await using var connection = new NpgsqlConnection(builder.ConnectionString);
            await connection.OpenAsync(cancellationToken);
            await using var command = connection.CreateCommand();
            command.CommandText = "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = @database";
            command.Parameters.AddWithValue("database", databaseName);
            await command.ExecuteNonQueryAsync(cancellationToken);
            command.Parameters.Clear();
            command.CommandText = $"DROP DATABASE IF EXISTS \"{databaseName}\"";
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "Failed to clean up tenant database {DatabaseName}", databaseName);
        }
    }
}
