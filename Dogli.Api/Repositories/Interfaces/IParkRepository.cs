using Dogli.Api.Models;

namespace Dogli.Api.Repositories.Interfaces;

public interface IParkRepository
{
    public Task<List<Park>> GetAllParksAsync();

    public Task<Park?> GetParkByIdAsync(string parkId);

    public Task CreateParkAsync(Park dogPark);

    public Task UpdateParkAsync(Park dogPark);

    public Task DeleteParkAsync(string parkId);

    public Task<Park?> GetParkByPlaceIdAsync(string placeId);
}