using Dogli.Api.Models;
using Dogli.Api.Repositories.Interfaces;
using MongoDB.Driver;

namespace Dogli.Api.Repositories
{
    public class ReviewRepository(IMongoDatabase database) : IReviewRepository
    {
        private readonly IMongoCollection<Review> _reviews = database.GetCollection<Review>("reviews");

        public async Task<List<Review>> GetReviewsByParkIdAsync(string parkId) =>
            await _reviews.Find(r => r.ParkId == parkId).ToListAsync();

        public async Task<Review?> GetReviewByIdAsync(string reviewId) =>
            await _reviews.Find(r => r.Id == reviewId).FirstOrDefaultAsync();

        public async Task CreateReviewAsync(Review review) =>
            await _reviews.InsertOneAsync(review);
    }
}