using MassagePlatform.WebApi.Services;
using Xunit;

namespace MassagePlatform.WebApi.Tests;

public sealed class TenantProvisionerTests
{
    [Theory]
    [InlineData("massage-shop")]
    [InlineData("store1")]
    [InlineData("a")]
    [InlineData("a-1")]
    [InlineData("123")]
    public void Accepts_safe_lowercase_tenant_slugs(string slug)
    {
        Assert.True(TenantProvisioner.IsValidSlug(slug));
    }

    [Theory]
    [InlineData("")]
    [InlineData("-store")]
    [InlineData("store-")]
    [InlineData("Massage-Shop")]
    [InlineData("two words")]
    [InlineData("store;drop database")]
    [InlineData("a_b")]
    [InlineData("abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijkl")]
    public void Rejects_invalid_or_unsafe_tenant_slugs(string slug)
    {
        Assert.False(TenantProvisioner.IsValidSlug(slug));
    }
}
