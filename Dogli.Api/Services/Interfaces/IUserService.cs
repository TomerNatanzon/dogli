using Dogli.Api.Models;

namespace Dogli.Api.Services.Interfaces;

public interface IUserService
{
    public Task<List<User>> GetAllUsersAsync();

    public Task<User?> GetUserByIdAsync(string userId);

    public Task<User?> GetUserByEmailAsync(string email);

    public Task<User?> GetUserByUsernameAsync(string email);

    public Task<User?> CreateUserAsync(User user);

    public Task UpdateUserAsync(User user);

    public Task DeleteUserAsync(string userId);
}