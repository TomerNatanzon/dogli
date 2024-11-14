using Dogli.Api.Enums;
using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;
using Dogli.Api.Repositories;
using Dogli.Api.Repositories.Interfaces;
using Dogli.Api.Services.Interfaces;
using Serilog;
using System.Linq;

namespace Dogli.Api.Services;

public class ParkService(IParkRepository parkRepository, ICheckInRepository checkInRepository, IGooglePlacesService googlePlacesService, IDogService dogService, ILogger<ParkService> logger) : IParkService
{

    public async Task<List<Park>> GetAllParksAsync() => await parkRepository.GetAllParksAsync();

    public async Task<Park?> GetParkByIdAsync(string parkId) => await parkRepository.GetParkByIdAsync(parkId);

    public async Task<List<CheckIn>> GetActiveCheckInsAsync(string parkId) => await checkInRepository.GetActiveCheckInsAsync(parkId);

    public async Task<List<CheckIn>> GetHistoricalCheckInsAsync(string parkId) => await checkInRepository.GetHistoricalCheckInsAsync(parkId);

    public async Task<List<CheckIn>> GetUserCheckInsAsync(string userId) => await checkInRepository.GetUserCheckInsAsync(userId);

    public async Task<Park?> GetParkByGooglePlaceIdAsync(string placeId) => await parkRepository.GetParkByPlaceIdAsync(placeId);

    public async Task<Park?> GetOrFetchParkByPlaceIdAsync(string placeId)
    {
        var existingPark = await GetParkByGooglePlaceIdAsync(placeId);
        if (existingPark != null)
        {
            return existingPark;
        }

        var googlePlacePark = await googlePlacesService.GetParkDetailsAsync(placeId);
        if (googlePlacePark == null)
        {
            return null;
        }

        await parkRepository.CreateParkAsync(googlePlacePark);
        var createdPark = await parkRepository.GetParkByPlaceIdAsync(placeId);
        return createdPark;
    }

    public async Task<List<Park>> GetNearbyDogParksAsync(double latitude, double longitude, int radius)
    {
        var parks = await googlePlacesService.GetNearbyDogParksAsync(latitude, longitude, radius);
        var existingParks = await parkRepository.GetAllParksAsync();
        var existingPlaceIds = new HashSet<string>(existingParks.Select(p => p.PlaceId));
        var nearbyParks = new List<Park>();
        var nearbyPlaceIds = new HashSet<string>(parks.Select(p => p.PlaceId));

        nearbyParks.AddRange(existingParks.Where(exPark => nearbyPlaceIds.Contains(exPark.PlaceId)));
        foreach (var park in parks.Where(park => !existingPlaceIds.Contains(park.PlaceId)))
        {
            await parkRepository.CreateParkAsync(park);
            var createdPark = await parkRepository.GetParkByPlaceIdAsync(park.PlaceId);
            if (createdPark != null)
            {
                nearbyParks.Add(createdPark);
            }
        }

        logger.LogInformation(nearbyParks.ToString());
        return nearbyParks;
    }

    public async Task CreateParkAsync(ParkDto parkDto)
    {
        var park = new Park
        {
            Name = parkDto.Name,
            Address = parkDto.Address,
            Latitude = parkDto.Latitude,
            Longitude = parkDto.Longitude,
            PlaceId = parkDto.PlaceId
        };
        try
        {
            await parkRepository.CreateParkAsync(park);
            logger.LogInformation("Park for PlaceId: {PlaceId} created successfully.", parkDto.PlaceId);
        }
        catch (Exception e)
        {
            string message = $"error occurred while creating park:\n{e.Message}";
            logger.LogError(e, message);
            throw;
        }
    }

    public async Task<Park?> UpdateParkAsync(string parkId, ParkDto parkDto)
    {
        var park = await parkRepository.GetParkByIdAsync(parkId);
        if (park == null)
        {
            return null;
        }

        park.Name = parkDto.Name;
        park.Address = parkDto.Address;
        park.Latitude = parkDto.Latitude;
        park.Longitude = parkDto.Longitude;
        park.PlaceId = parkDto.PlaceId;

        await parkRepository.UpdateParkAsync(park);
        return park;
    }

    public async Task<Park?> UpdateParkRatingAsync(string parkId, double rating)
    {
        var park = await parkRepository.GetParkByIdAsync(parkId);
        if (park == null)
        {
            return null;
        }

        park.Rating = rating;

        await parkRepository.UpdateParkAsync(park);
        return park;
    }

    public async Task DeleteParkAsync(string parkId) => await parkRepository.DeleteParkAsync(parkId);

    public async Task<CheckInResult> CheckInToParkAsync(string userId, CheckInDto checkInDto)
    {

        var park = await GetOrFetchParkByPlaceIdAsync(checkInDto.ParkPlaceId);
        if (park == null)
        {
            return CheckInResult.ParkNotFound;
        }

        var dog = await dogService.GetDogByIdAsync(checkInDto.DogId);
        if (dog == null || dog.OwnerId != userId)
        {
            return CheckInResult.DogNotOwnedByUser;
        }

        var distance = CalculateDistance(park.Latitude, park.Longitude, checkInDto.Latitude, checkInDto.Longitude);
        if (distance > 200)
        {
            return CheckInResult.DistanceTooFar;
        }

        await checkInRepository.DeactivateActiveCheckInsAsync(userId, dog.Id!);

        var checkIn = new CheckIn
        {
            UserId = userId,
            ParkId = park.Id!,
            ArrivalTime = DateTime.UtcNow,
            DogId = checkInDto.DogId,
            Timestamps = new Timestamps()
        };

        await checkInRepository.CreateCheckInAsync(checkIn);
        return CheckInResult.Success;
    }

    public async Task<CheckOutResult> CheckoutAsync(string checkInId)
    {
        var checkIn = await checkInRepository.GetCheckInByIdAsync(checkInId);
        if (checkIn == null)
        {
            return CheckOutResult.CheckInNotFound;
        }

        checkIn.IsActive = false;
        checkIn.LeaveTime = DateTime.UtcNow;
        checkIn.Timestamps.UpdatedAt = DateTime.UtcNow;

        await checkInRepository.UpdateCheckInAsync(checkIn);
        return CheckOutResult.Success;
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        const double R = 6371e3; // Radius of the Earth in meters
        var φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        var φ2 = lat2 * Math.PI / 180;
        var Δφ = (lat2 - lat1) * Math.PI / 180;
        var Δλ = (lon2 - lon1) * Math.PI / 180;

        var a = Math.Sin(Δφ / 2) * Math.Sin(Δφ / 2) +
                Math.Cos(φ1) * Math.Cos(φ2) *
                Math.Sin(Δλ / 2) * Math.Sin(Δλ / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

        var d = R * c; // Distance in meters
        return d;
    }
}