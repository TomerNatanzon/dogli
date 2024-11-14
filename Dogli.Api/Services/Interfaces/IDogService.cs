using Dogli.Api.Models;

namespace Dogli.Api.Services.Interfaces;

public interface IDogService
{
    public Task<List<Dog>> GetAllDogsAsync();

    public Task<List<Dog>> GetDogsByOwnerAsync(string ownerId);

    public Task<Dog?> GetDogByIdAsync(string dogId);

    public Task<Dog> CreateDogAsync(Dog dog);

    public Task<Result> UpdateDogAsync(string userId, string dogId, Dog updatedDog);

    public Task DeleteDogAsync(string dogId);

    public Task<ResponseModel> FollowDogAsync(string userId, string followerDogId, string followingDogId);

    public Task<ResponseModel> UnfollowDogAsync(string userId, string followerDogId, string followingDogId);
}