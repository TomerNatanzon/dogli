using Dogli.Api.Models;
using Dogli.Api.Repositories.Interfaces;
using MongoDB.Driver;

#pragma warning disable S6966

namespace Dogli.Api.Repositories;

public class CheckInRepository(IMongoDatabase database) : ICheckInRepository
{
    private readonly IMongoCollection<CheckIn> _checkIns = database.GetCollection<CheckIn>("checkins");

    public async Task<List<CheckIn>> GetAllCheckInsAsync() => await _checkIns.Find(_ => true).ToListAsync();

    public async Task<CheckIn?> GetCheckInByIdAsync(string checkInId) => await _checkIns.Find(checkIn => checkIn.Id == checkInId).FirstOrDefaultAsync();

    public async Task CreateCheckInAsync(CheckIn checkIn) => await _checkIns.InsertOneAsync(checkIn);

    public async Task DeleteCheckInAsync(string checkInId) => await _checkIns.DeleteOneAsync(checkIn => checkIn.Id == checkInId);

    public async Task UpdateCheckInAsync(CheckIn checkIn) => await _checkIns.ReplaceOneAsync(c => c.Id == checkIn.Id, checkIn);

    public async Task DeactivateActiveCheckInsAsync(string userId, string dogId)
    {
        var filter = Builders<CheckIn>.Filter.And(
            Builders<CheckIn>.Filter.Eq(c => c.UserId, userId),
            Builders<CheckIn>.Filter.Eq(c => c.DogId, dogId),
            Builders<CheckIn>.Filter.Eq(c => c.IsActive, true)
        );

        var update = Builders<CheckIn>.Update
            .Set(c => c.IsActive, false)
            .Set(c => c.Timestamps.UpdatedAt, DateTime.UtcNow); ;

        await _checkIns.UpdateManyAsync(filter, update);
    }

    public async Task<List<CheckIn>> GetActiveCheckInsAsync(string parkId)
    {
        var filter = Builders<CheckIn>.Filter.And(
            Builders<CheckIn>.Filter.Eq(c => c.ParkId, parkId),
            Builders<CheckIn>.Filter.Eq(c => c.IsActive, true)
        );

        return await _checkIns.Find(filter).ToListAsync();
    }

    public async Task<List<CheckIn>> GetHistoricalCheckInsAsync(string parkId)
    {
        var filter = Builders<CheckIn>.Filter.And(
            Builders<CheckIn>.Filter.Eq(c => c.ParkId, parkId),
            Builders<CheckIn>.Filter.Eq(c => c.IsActive, false)
        );

        return await _checkIns.Find(filter).ToListAsync();
    }

    public async Task<List<CheckIn>> GetUserCheckInsAsync(string userId) => await _checkIns.Find(c => c.UserId == userId).ToListAsync();
}