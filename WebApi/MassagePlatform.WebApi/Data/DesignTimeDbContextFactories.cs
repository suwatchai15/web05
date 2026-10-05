using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace MassagePlatform.WebApi.Data;

public sealed class PlatformDesignTimeFactory : IDesignTimeDbContextFactory<PlatformDbContext>
{
    public PlatformDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Platform");
        if (string.IsNullOrWhiteSpace(connection))
            throw new InvalidOperationException("Set ConnectionStrings__Platform to generate platform migrations.");
        return new PlatformDbContext(new DbContextOptionsBuilder<PlatformDbContext>().UseNpgsql(connection).Options);
    }
}

public sealed class TenantDesignTimeFactory : IDesignTimeDbContextFactory<TenantDbContext>
{
    public TenantDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("TenantDatabase__AdminConnectionString");
        if (string.IsNullOrWhiteSpace(connection))
            throw new InvalidOperationException("Set TenantDatabase__AdminConnectionString to generate tenant migrations.");
        return new TenantDbContext(new DbContextOptionsBuilder<TenantDbContext>().UseNpgsql(connection).Options);
    }
}
