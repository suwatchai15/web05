namespace MassagePlatform.WebApi.Tenancy;

public sealed class TenantScope
{
    public Guid? TenantId { get; private set; }
    public string? DatabaseName { get; private set; }
    public void Set(Guid id, string databaseName) { TenantId = id; DatabaseName = databaseName; }
}
