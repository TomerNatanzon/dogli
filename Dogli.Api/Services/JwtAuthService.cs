using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dogli.Api.Models;
using Dogli.Api.Services.Interfaces;

namespace Dogli.Api.Services;

public class JwtAuthService(IConfiguration configuration, ILogger<JwtAuthService> logger) : IJwtAuthService
{
    private readonly string? _secretKey = configuration["Jwt:SecretKey"];

    public string GenerateToken(User user)
    {
        try
        {
            if (string.IsNullOrEmpty(_secretKey))
                throw new InvalidOperationException("JWT secret was not configured");

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("full_name", user.FullName ?? string.Empty),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.Now.AddHours(5),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        catch (InvalidOperationException ex)
        {
            logger.LogError(ex, "InvalidOperationException occurred while generating jwt");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error occurred while authenticating user");
            throw;
        }
    }
}