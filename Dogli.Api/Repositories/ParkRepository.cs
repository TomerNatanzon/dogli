using Dogli.Api.Models;
using Dogli.Api.Repositories.Interfaces;
using MongoDB.Driver;

namespace Dogli.Api.Repositories;

public class ParkRepository(IMongoDatabase database) : IParkRepository
{
    private readonly IMongoCollection<Park> _dogParks = database.GetCollection<Park>("dog-parks");

    public async Task<List<Park>> GetAllParksAsync() => await _dogParks.Find(_ => true).ToListAsync();

    public async Task<Park?> GetParkByIdAsync(string parkId) => await _dogParks.Find(dogPark => dogPark.Id == parkId).FirstOrDefaultAsync();

    public async Task<Park?> GetParkByPlaceIdAsync(string placeId) => await _dogParks.Find(park => park.PlaceId == placeId).FirstOrDefaultAsync();

    public async Task CreateParkAsync(Park dogPark) => await _dogParks.InsertOneAsync(dogPark);

    public async Task UpdateParkAsync(Park dogPark) => await _dogParks.ReplaceOneAsync(dp => dp.Id == dogPark.Id, dogPark);

    public async Task DeleteParkAsync(string parkId) => await _dogParks.DeleteOneAsync(dp => dp.Id == parkId);
}