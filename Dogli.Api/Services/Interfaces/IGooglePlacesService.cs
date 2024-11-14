using Dogli.Api.Models;

namespace Dogli.Api.Services.Interfaces
{
    public interface IGooglePlacesService
    {
        Task<Park?> GetParkDetailsAsync(string placeId);

        Task<List<Park>> GetNearbyDogParksAsync(double latitude, double longitude, int radius);
    }
}