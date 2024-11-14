using Dogli.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Dogli.Api.Repositories.Interfaces
{
    public interface ICheckInRepository
    {
        public Task<List<CheckIn>> GetAllCheckInsAsync();

        public Task<List<CheckIn>> GetActiveCheckInsAsync(string parkId);

        public Task<List<CheckIn>> GetHistoricalCheckInsAsync(string parkId);

        public Task<List<CheckIn>> GetUserCheckInsAsync(string userId);

        public Task<CheckIn?> GetCheckInByIdAsync(string checkInId);

        public Task CreateCheckInAsync(CheckIn checkIn);

        public Task DeleteCheckInAsync(string checkInId);

        public Task UpdateCheckInAsync(CheckIn checkIn);

        public Task DeactivateActiveCheckInsAsync(string userId, string dogId);
    }
}