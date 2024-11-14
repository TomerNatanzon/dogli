using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;
using Dogli.Api.Repositories.Interfaces;
using Dogli.Api.Services.Interfaces;
using Serilog;

namespace Dogli.Api.Services
{
    public class ReviewService(IReviewRepository reviewRepository, IParkService parkService, ILogger<ReviewService> logger) : IReviewService
    {
        public async Task<List<Review>> GetReviewsByParkIdAsync(string parkId) =>
            await reviewRepository.GetReviewsByParkIdAsync(parkId);

        public async Task<Review?> GetReviewByIdAsync(string reviewId) =>
            await reviewRepository.GetReviewByIdAsync(reviewId);

        public async Task<Review?> CreateReviewAsync(string userId, ReviewDto reviewDto, UserProfileDto? userProfile)
        {
            var parkToReview = await parkService.GetParkByGooglePlaceIdAsync(reviewDto.ParkPlaceId);
            if (parkToReview?.Id == null)
            {
                return null;
            }

            var review = new Review
            {
                UserId = userId,
                ParkId = parkToReview.Id,
                Rating = reviewDto.Rating,
                Title = reviewDto.Title,
                Description = reviewDto.Description,
                Timestamps = new Timestamps { CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
            };

            if (userProfile != null)
            {
                review.UserProfile = userProfile;
            }

            try
            {
                await reviewRepository.CreateReviewAsync(review);
                logger.LogInformation("Review created successfully with ID: {ReviewId}. Created by: {UserProfile}", review.Id, review.UserProfile);
                return review;
            }
            catch (Exception e)
            {
                logger.LogError(e, "error occurred while creating a review");
                throw;
            }
        }
    }
}