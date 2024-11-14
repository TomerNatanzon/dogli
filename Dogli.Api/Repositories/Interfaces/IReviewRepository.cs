using Dogli.Api.Models;

namespace Dogli.Api.Repositories.Interfaces
{
    public interface IReviewRepository
    {
        public Task<List<Review>> GetReviewsByParkIdAsync(string parkId);

        public Task CreateReviewAsync(Review review);

        public Task<Review?> GetReviewByIdAsync(string reviewId);
    }
}