using System.ComponentModel.DataAnnotations;
using Dogli.Api.Models;
using Dogli.Api.Repositories;
using Dogli.Api.Repositories.Interfaces;
using Dogli.Api.Services.Interfaces;
using Dogli.Api.Utils.DogUtils;
using Serilog;

namespace Dogli.Api.Services;

public class DogService(IDogRepository dogRepository, ILogger<DogService> logger) : IDogService
{
    // TODO: Implement all the logic here

    public async Task<List<Dog>> GetAllDogsAsync() => await dogRepository.GetAllDogsAsync();

    public async Task<List<Dog>> GetDogsByOwnerAsync(string ownerId) => await dogRepository.GetDogsByOwnerAsync(ownerId);

    public async Task<Dog?> GetDogByIdAsync(string dogId) => await dogRepository.GetDogByIdAsync(dogId);

    public async Task<Dog> CreateDogAsync(Dog dog)
    {
        try
        {
            await dogRepository.CreateDogAsync(dog);
            logger.LogInformation("Dog created successfully with ID: {DogId}", dog.Id);
            return dog;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "error occurred while creating dog");
            throw;
        }
    }

    public async Task<ResponseModel> FollowDogAsync(string userId, string followerDogId, string followingDogId)
    {
        var followerDog = await dogRepository.GetDogByIdAsync(followerDogId);
        if (followerDog == null || followerDog.OwnerId != userId)
        {
            return new ResponseModel { StatusCode = 403, Message = "The follower dog is not owned by the user." };
        }

        var followingDog = await dogRepository.GetDogByIdAsync(followingDogId);
        if (followingDog == null)
        {
            return new ResponseModel { StatusCode = 404, Message = "The following dog does not exist." };
        }

        await dogRepository.FollowDogAsync(followerDogId, followingDogId);
        logger.LogInformation("Dog with ID: '{FollowerId}' is now following dog '{FollowingId}' ", followerDogId, followingDogId);
        return new ResponseModel { StatusCode = 200, Message = "Follow successful" };
    }

    public async Task<ResponseModel> UnfollowDogAsync(string userId, string followerDogId, string followingDogId)
    {
        var followerDog = await dogRepository.GetDogByIdAsync(followerDogId);
        if (followerDog == null || followerDog.OwnerId != userId)
        {
            return new ResponseModel { StatusCode = 403, Message = "The follower dog is not owned by the user." };
        }

        var followingDog = await dogRepository.GetDogByIdAsync(followingDogId);
        if (followingDog == null)
        {
            return new ResponseModel { StatusCode = 404, Message = "The following dog does not exist." };
        }

        await dogRepository.UnfollowDogAsync(followerDogId, followingDogId);
        logger.LogInformation("Dog with ID: '{FollowerId}' unfollowed '{FollowingId}' ", followerDogId, followingDogId);
        return new ResponseModel { StatusCode = 200, Message = "Unfollow successful" };
    }

    public async Task<Result> UpdateDogAsync(string userId, string dogId, Dog updatedDog)
    {
        var dogs = await dogRepository.GetDogsByOwnerAsync(userId);
        var dog = dogs.Find(d => d.Id == dogId);

        if (dog == null)
        {
            return Result.Failure(DogErrors.NotFound(dogId));
        }

        dog.Name = updatedDog.Name;
        dog.Breed = updatedDog.Breed;
        dog.BirthDate = updatedDog.BirthDate ?? dog.BirthDate;
        dog.Gender = updatedDog.Gender ?? dog.Gender;
        dog.Description = updatedDog.Description ?? dog.Description;
        dog.IsSpayedOrNeutered = updatedDog.IsSpayedOrNeutered ?? dog.IsSpayedOrNeutered;
        dog.Weight = updatedDog.Weight ?? dog.Weight;
        dog.ProfileImageUrl = updatedDog.ProfileImageUrl ?? dog.ProfileImageUrl;

        await dogRepository.UpdateDogAsync(dog);
        return Result.Success();
    }

    public async Task DeleteDogAsync(string dogId) => await dogRepository.DeleteDogAsync(dogId);
}