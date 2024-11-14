using Dogli.Api.Models;
using Dogli.Api.Repositories.Interfaces;
using MongoDB.Driver;

namespace Dogli.Api.Repositories;

public class DogRepository(IMongoDatabase database) : IDogRepository
{
    private readonly IMongoCollection<Dog> _dogs = database.GetCollection<Dog>("dogs");

    public async Task<List<Dog>> GetAllDogsAsync() => await _dogs.Find(_ => true).ToListAsync();

    public async Task<List<Dog>> GetDogsByOwnerAsync(string ownerId) => await _dogs.Find(dog => dog.OwnerId == ownerId).ToListAsync();

    public async Task<Dog?> GetDogByIdAsync(string dogId) => await _dogs.Find(dog => dog.Id == dogId).FirstOrDefaultAsync();

    public async Task CreateDogAsync(Dog dog) => await _dogs.InsertOneAsync(dog);

    public async Task UpdateDogAsync(Dog dog) => await _dogs.ReplaceOneAsync(d => d.Id == dog.Id, dog);

    public async Task DeleteDogAsync(string dogId) => await _dogs.DeleteOneAsync(d => d.Id == dogId);

    public async Task FollowDogAsync(string followerDogId, string followingDogId)
    {
        var filterFollower = Builders<Dog>.Filter.Eq(d => d.Id, followerDogId);
        var updateFollower = Builders<Dog>.Update.AddToSet(d => d.Following, followingDogId);

        var filterFollowing = Builders<Dog>.Filter.Eq(d => d.Id, followingDogId);
        var updateFollowing = Builders<Dog>.Update.AddToSet(d => d.Followers, followerDogId);

        await _dogs.UpdateOneAsync(filterFollower, updateFollower);
        await _dogs.UpdateOneAsync(filterFollowing, updateFollowing);
    }

    public async Task UnfollowDogAsync(string followerDogId, string followingDogId)
    {
        var filterFollower = Builders<Dog>.Filter.Eq(d => d.Id, followerDogId);
        var updateFollower = Builders<Dog>.Update.Pull(d => d.Following, followingDogId);

        var filterFollowing = Builders<Dog>.Filter.Eq(d => d.Id, followingDogId);
        var updateFollowing = Builders<Dog>.Update.Pull(d => d.Followers, followerDogId);

        await _dogs.UpdateOneAsync(filterFollower, updateFollower);
        await _dogs.UpdateOneAsync(filterFollowing, updateFollowing);
    }
}