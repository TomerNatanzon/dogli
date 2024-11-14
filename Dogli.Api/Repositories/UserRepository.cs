using Dogli.Api.Models;
using Dogli.Api.Repositories.Interfaces;
using MongoDB.Driver;

namespace Dogli.Api.Repositories;

public class UserRepository(IMongoDatabase database) : IUserRepository
{
    private readonly IMongoCollection<User> _users = database.GetCollection<User>("users");

    public async Task<List<User>> GetAllUsersAsync() => await _users.Find(_ => true).ToListAsync();

    public async Task<User?> GetUserByIdAsync(string userId) => await _users.Find(user => user.Id == userId).FirstOrDefaultAsync();

    public async Task<User?> GetUserByEmailAsync(string email) => await _users.Find(user => user.Email == email).FirstOrDefaultAsync();

    public async Task<User?> GetUserByUsernameAsync(string username) => await _users.Find(user => user.Username == username).FirstOrDefaultAsync();

    public async Task CreateUserAsync(User user) => await _users.InsertOneAsync(user);

    public async Task UpdateUserAsync(User user) => await _users.ReplaceOneAsync(u => u.Id == user.Id, user);

    public async Task DeleteUserAsync(string userId) => await _users.DeleteOneAsync(u => u.Id == userId);
}