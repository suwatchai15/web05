using MassagePlatform.WebApi.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MassagePlatform.WebApi.Tenancy;

public sealed class TenantDatabase(IConfiguration configuration)
{
    public string ConnectionString(string databaseName)
    {
        var configured = configuration["TenantDatabase:AdminConnectionString"];
        if (string.IsNullOrWhiteSpace(configured))
            throw new InvalidOperationException("Missing configuration: TenantDatabase:AdminConnectionString");
        var builder = new NpgsqlConnectionStringBuilder(configured) { Database = databaseName };
        return builder.ConnectionString;
    }

    public string AdminConnectionString()
    {
        var configured = configuration["TenantDatabase:AdminConnectionString"];
        if (string.IsNullOrWhiteSpace(configured))
            throw new InvalidOperationException("Missing configuration: TenantDatabase:AdminConnectionString");
        return configured;
    }
}
