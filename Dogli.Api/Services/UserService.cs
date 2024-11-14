using Dogli.Api.Extensions;
using Dogli.Api.Models;
using Dogli.Api.Repositories;
using Dogli.Api.Repositories.Interfaces;
using Dogli.Api.Services.Interfaces;
using FluentValidation;
using Serilog;

namespace Dogli.Api.Services;

public class UserService(IUserRepository userRepository, ILogger<UserService> logger) : IUserService
{

    public async Task<List<User>> GetAllUsersAsync() => await userRepository.GetAllUsersAsync();

    public async Task<User?> GetUserByEmailAsync(string email) => await userRepository.GetUserByEmailAsync(email);

    public async Task<User?> GetUserByUsernameAsync(string username) => await userRepository.GetUserByUsernameAsync(username);

    public async Task<User?> GetUserByIdAsync(string userId)
    {
        try
        {
            return await userRepository.GetUserByIdAsync(userId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error occurred while getting a user");
            throw;
        }
    }

    public async Task<User?> CreateUserAsync(User user)
    {
        try
        {
            user.ProfileImageUrl = user.Gender == "female"
                ? "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Ffemale-default-profile-image.png?alt=media&token=4471f7f3-85dc-4699-8822-c6ed1149a4ae"
                : "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Fmale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7";

            await userRepository.CreateUserAsync(user);
            var createdUser = await userRepository.GetUserByEmailAsync(user.Email);
            return createdUser;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error occurred while creating a user");
            throw;
        }
    }

    public async Task UpdateUserAsync(User user)
    {
        try
        {
            await userRepository.UpdateUserAsync(user);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error occurred while updating user");
            throw;
        }
    }

    public async Task DeleteUserAsync(string userId) => await userRepository.DeleteUserAsync(userId);
}