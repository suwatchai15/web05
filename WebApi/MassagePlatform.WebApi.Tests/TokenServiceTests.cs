using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using MassagePlatform.WebApi.Security;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace MassagePlatform.WebApi.Tests;

public sealed class TokenServiceTests
{
    [Fact]
    public void Tenant_token_contains_tenant_identity_and_role()
    {
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:SigningKey"] = "a-test-signing-key-that-is-at-least-32-bytes-long",
            ["Jwt:Issuer"] = "test-issuer",
            ["Jwt:Audience"] = "test-audience"
        }).Build();
        var service = new TokenService(configuration);
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var token = new JwtSecurityTokenHandler().ReadJwtToken(
            service.CreateTenantToken(tenantId, userId, "owner@example.test", "Owner"));

        Assert.Equal(tenantId.ToString(), token.Claims.Single(x => x.Type == "tenant_id").Value);
        Assert.Equal(userId.ToString(), token.Claims.Single(x => x.Type == ClaimTypes.NameIdentifier).Value);
        Assert.Equal("Owner", token.Claims.Single(x => x.Type == ClaimTypes.Role).Value);
        Assert.Equal("test-issuer", token.Issuer);
        Assert.Contains("test-audience", token.Audiences);
    }
}
