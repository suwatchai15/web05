using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MassagePlatform.WebApi.Security;

public sealed class TokenService(IConfiguration configuration)
{
    public string CreateTenantToken(Guid tenantId, Guid userId, string email, string role) =>
        Create([new Claim("tenant_id", tenantId.ToString()), new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email), new Claim(ClaimTypes.Role, role)]);

    public string CreatePlatformToken(string username) =>
        Create([new Claim(ClaimTypes.NameIdentifier, username), new Claim(ClaimTypes.Role, "PlatformAdmin")]);

    private string Create(IEnumerable<Claim> claims)
    {
        var key = configuration["Jwt:SigningKey"]!;
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(configuration["Jwt:Issuer"], configuration["Jwt:Audience"],
            claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
