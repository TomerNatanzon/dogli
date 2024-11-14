using Dogli.Api.Models;

namespace Dogli.Api.Repositories.Interfaces;

public interface IDogRepository
{
    public Task<List<Dog>> GetAllDogsAsync();

    public Task<List<Dog>> GetDogsByOwnerAsync(string ownerId);

    public Task<Dog?> GetDogByIdAsync(string dogId);

    public Task CreateDogAsync(Dog dog);

    public Task UpdateDogAsync(Dog dog);

    public Task DeleteDogAsync(string dogId);

    public Task FollowDogAsync(string followerDogId, string followingDogId);

    public Task UnfollowDogAsync(string followerDogId, string followingDogId);
}