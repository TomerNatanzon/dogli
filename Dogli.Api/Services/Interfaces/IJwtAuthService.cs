using Dogli.Api.Models;

namespace Dogli.Api.Services.Interfaces
{
    public interface IJwtAuthService
    {
        public string GenerateToken(User user);
    }
}