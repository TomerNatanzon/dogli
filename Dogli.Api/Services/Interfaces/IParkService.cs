using Dogli.Api.Enums;
using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;

namespace Dogli.Api.Services.Interfaces;

public interface IParkService
{
    public Task<List<Park>> GetAllParksAsync();

    public Task<Park?> GetParkByIdAsync(string parkId);

    public Task<Park?> GetParkByGooglePlaceIdAsync(string placeId);

    public Task<Park?> GetOrFetchParkByPlaceIdAsync(string placeId);

    public Task CreateParkAsync(ParkDto parkDto);

    public Task<Park?> UpdateParkAsync(string parkId, ParkDto parkDto);

    public Task<Park?> UpdateParkRatingAsync(string parkId, double rating);

    public Task DeleteParkAsync(string parkId);

    public Task<CheckInResult> CheckInToParkAsync(string userId, CheckInDto checkInDto);

    public Task<CheckOutResult> CheckoutAsync(string checkInId);

    public Task<List<Park>> GetNearbyDogParksAsync(double latitude, double longitude, int radius);

    public Task<List<CheckIn>> GetActiveCheckInsAsync(string parkId);

    public Task<List<CheckIn>> GetHistoricalCheckInsAsync(string parkId);

    public Task<List<CheckIn>> GetUserCheckInsAsync(string userId);
}