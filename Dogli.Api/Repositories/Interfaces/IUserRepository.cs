using Dogli.Api.Models;

namespace Dogli.Api.Repositories.Interfaces;

public interface IUserRepository
{
    public Task<List<User>> GetAllUsersAsync();

    public Task<User?> GetUserByIdAsync(string userId);

    public Task<User?> GetUserByEmailAsync(string email);

    public Task<User?> GetUserByUsernameAsync(string username);

    public Task CreateUserAsync(User user);

    public Task UpdateUserAsync(User user);

    public Task DeleteUserAsync(string userId);
}