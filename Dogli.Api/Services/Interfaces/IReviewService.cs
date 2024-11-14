using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;

namespace Dogli.Api.Services.Interfaces
{
    public interface IReviewService
    {
        public Task<List<Review>> GetReviewsByParkIdAsync(string parkId);

        public Task<Review?> CreateReviewAsync(string userId, ReviewDto reviewDto, UserProfileDto? userProfile);

        public Task<Review?> GetReviewByIdAsync(string reviewId);
    }
}