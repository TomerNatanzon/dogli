using Dogli.Api.Enums;
using Dogli.Api.Models.DTOs;
using Dogli.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using AutoMapper;
using Dogli.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace Dogli.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController(IReviewService reviewService, IParkService parkService, IUserService userService, IMapper mapper) : ControllerBase
    {

        // GET: api/reviews/{parkId}
        [HttpGet("{parkId}")]
        public async Task<IActionResult> GetReviewsByParkId([FromRoute] string parkId)
        {
            var park = await parkService.GetParkByIdAsync(parkId);
            if (park == null)
            {
                return NotFound($"Park with id '{parkId}' was not found");
            }
            var reviews = await reviewService.GetReviewsByParkIdAsync(parkId);
            return Ok(reviews);
        }

        // GET: api/reviews/review?reviewId={reviewId}
        [HttpGet("review")]
        public async Task<IActionResult> GetReviewById([FromQuery] string reviewId)
        {
            var review = await reviewService.GetReviewByIdAsync(reviewId);
            return review != null ? Ok(review) : NotFound();
        }

        // POST: api/reviews
        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] ReviewDto reviewDto)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            // test below
            var author = userId.IsNullOrEmpty() ? null : await userService.GetUserByIdAsync(userId!);

            if (string.IsNullOrEmpty(userId) || author == null)
            {
                return Unauthorized();
            }

            var userName = User.FindFirstValue(JwtRegisteredClaimNames.UniqueName);
            var fullName = User.FindFirstValue("full_name");
            var email = User.FindFirstValue(JwtRegisteredClaimNames.Email);
            Console.WriteLine($"userName: {userName}, fullName: {fullName}, email {email}");
            var userProfileDto = mapper.Map<UserProfileDto>(author);

            var parkToReview = await parkService.GetOrFetchParkByPlaceIdAsync(reviewDto.ParkPlaceId);
            if (parkToReview == null)
            {
                return BadRequest("Review creation failed. Park was not found");
            }

            var review = await reviewService.CreateReviewAsync(userId, reviewDto, userProfileDto);
            if (review == null)
            {
                return BadRequest("Review creation failed.");
            }

            var parkReviews = await reviewService.GetReviewsByParkIdAsync(review.ParkId);
            double newRating = parkReviews.Count == 0
                ? reviewDto.Rating
                : (double)parkReviews.Sum(r => r.Rating) / parkReviews.Count;
            await parkService.UpdateParkRatingAsync(review.ParkId, newRating);
            return CreatedAtAction(nameof(GetReviewById), new { id = review.Id }, review);
        }
    }
}