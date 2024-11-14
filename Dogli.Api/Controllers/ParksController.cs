using System.IdentityModel.Tokens.Jwt;
using Dogli.Api.Models.DTOs;
using Dogli.Api.Services;
using Dogli.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Dogli.Api.Enums;
using Dogli.Api.Models;
using Dogli.Api.Repositories;
using MongoDB.Bson;

namespace Dogli.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParksController(IParkService parkService) : ControllerBase
    {
        // GET: api/parks
        [HttpGet]
        public async Task<IActionResult> GetAllParks()
        {
            var parks = await parkService.GetAllParksAsync();
            return Ok(parks);
        }

        // GET api/parks/nearby?location={latitude},{longitude}&radius={radius}
        [Authorize(Policy = "AdminEmail")]
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearbyParks([FromQuery] string location, [FromQuery] int radius = 1000)
        {
            var coordinates = location.Split(',');
            if (coordinates.Length != 2 || !double.TryParse(coordinates[0], out var latitude) || !double.TryParse(coordinates[1], out var longitude))
            {
                return BadRequest("Invalid location format. Expected format: {latitude},{longitude}");
            }

            var parks = await parkService.GetNearbyDogParksAsync(latitude, longitude, radius);
            return Ok(parks);
        }

        // GET: api/parks/park-details/{placeId}
        [HttpGet("park-details/{placeId}")]
        public async Task<IActionResult> GetOrFetchParkByPlaceId(string placeId)
        {
            var park = await parkService.GetOrFetchParkByPlaceIdAsync(placeId);
            if (park == null)
            {
                return NotFound("Park details were not found. Make sure that the provided 'placeId' is correct.");
            }
            return Ok(park);
        }

        // POST: api/parks/checkin
        [HttpPost("checkin")]
        [Authorize]
        public async Task<IActionResult> CheckIn([FromBody] CheckInDto checkInDto)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var result = await parkService.CheckInToParkAsync(userId, checkInDto);
            var userCheckIns = await parkService.GetUserCheckInsAsync(userId);
            var park = await parkService.GetParkByGooglePlaceIdAsync(checkInDto.ParkPlaceId);
            var checkIn = userCheckIns.Where(c => c.IsActive && c.ParkId == park?.Id);

            return result switch
            {
                CheckInResult.Success => Ok(checkIn),
                CheckInResult.ParkNotFound => NotFound("Park not found"),
                CheckInResult.DogNotOwnedByUser => BadRequest("You do not own this dog"),
                CheckInResult.DistanceTooFar => BadRequest("You are not within 200 meters of the park"),
                _ => BadRequest("Check-in failed")
            };
        }

        // POST: api/parks/checkins/checkout/{checkInId}
        [HttpPost("checkins/checkout/{checkInId}")]
        [Authorize]
        public async Task<IActionResult> Checkout([FromRoute] string checkInId)
        {
            var result = await parkService.CheckoutAsync(checkInId);

            return result switch
            {
                CheckOutResult.CheckInNotFound => BadRequest("Check-out failed. The check-in record was not found."),
                CheckOutResult.Success => Ok("Check-out successful"),
                _ => BadRequest("Check-out failed. An unknown error occurred.")
            };
        }

        // POST: api/parks
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePark([FromBody] ParkDto parkDto)
        {
            var existingPark = await parkService.GetParkByGooglePlaceIdAsync(parkDto.PlaceId);
            if (existingPark != null)
            {
                return BadRequest("Park with the same placeId already exists");
            }

            await parkService.CreateParkAsync(parkDto);
            return CreatedAtAction(nameof(GetOrFetchParkByPlaceId), new { placeId = parkDto.PlaceId });
        }

        // PUT: api/parks/{parkId}
        [HttpPut("{parkId}")]
        [Authorize]
        public async Task<IActionResult> UpdatePark(string parkId, [FromBody] ParkDto parkDto)
        {
            var updatedPark = await parkService.UpdateParkAsync(parkId, parkDto);
            if (updatedPark == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        // GET: api/parks/{parkId}/active-checkins
        [HttpGet("{parkId}/active-checkins")]
        public async Task<IActionResult> GetActiveCheckIns(string parkId)
        {
            var checkIns = await parkService.GetActiveCheckInsAsync(parkId);
            return Ok(checkIns);
        }

        // GET: api/parks/{parkId}/historical-checkins
        [HttpGet("{parkId}/historical-checkins")]
        public async Task<IActionResult> GetHistoricalCheckIns(string parkId)
        {
            var checkIns = await parkService.GetHistoricalCheckInsAsync(parkId);
            return Ok(checkIns);
        }

        // GET: api/parks/checkins/{userId}
        [HttpGet("checkins/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetUserCheckIns(string userId)
        {
            var uid = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
            //var uid = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(uid) || uid != userId)
            {
                return Unauthorized();
            }
            var checkIns = await parkService.GetUserCheckInsAsync(userId);
            return Ok(checkIns);
        }

        // DELETE: api/parks/{parkId}
        [HttpDelete("{parkId}")]
        [Authorize]
        public async Task<IActionResult> DeletePark(string parkId)
        {
            var park = await parkService.GetParkByIdAsync(parkId);
            if (park == null)
            {
                return NotFound();
            }

            await parkService.DeleteParkAsync(parkId);
            return NoContent();
        }
    }
}