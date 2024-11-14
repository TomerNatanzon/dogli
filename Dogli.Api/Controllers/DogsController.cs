using System.IdentityModel.Tokens.Jwt;
using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;
using Dogli.Api.Services;
using Dogli.Api.Services.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.Security.Claims;
using Dogli.Api.Extensions;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Dogli.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DogsController(IDogService dogService, IValidator<Dog> validator) : ControllerBase
    {
        // GET: api/<DogsController>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Dog>>> Get()
        {
            var dogs = await dogService.GetAllDogsAsync();

            return Ok(dogs);
        }

        // GET: api/<DogsController>
        [HttpGet("my-dogs")]
        public async Task<ActionResult<IEnumerable<Dog>>> GetDogsByOwner()
        {
            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (userIdClaim == null)
            {
                return Unauthorized("Only authenticated users can view dogs.");
            }

            var ownerId = ObjectId.Parse(userIdClaim);
            var dogOwnerId = ownerId.ToString();

            var dogs = await dogService.GetDogsByOwnerAsync(dogOwnerId);

            return Ok(dogs);
        }

        // GET api/dogs/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Dog>> GetDogById(string id)
        {
            var dog = await dogService.GetDogByIdAsync(id);
            return dog != null ? Ok(dog) : NotFound();
        }

        // POST api/dogs/add
        [HttpPost("add")]
        public async Task<IActionResult> AddDog([FromBody] Dog dog)
        {
            var validationResult = await validator.ValidateAsync(dog);

            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub);

            if (userIdClaim == null)
            {
                return Unauthorized("Only authenticated users can add a new dog.");
            }

            var ownerId = ObjectId.Parse(userIdClaim);
            dog.OwnerId = ownerId.ToString();

            await dogService.CreateDogAsync(dog);
            return CreatedAtAction(nameof(GetDogById), new { id = dog.Id }, dog);
        }

        // PUT api/<DogsController>/5
        [HttpPut("{dogId}")]
        public async Task<IActionResult> Put([FromRoute] string dogId, [FromBody] Dog dogData)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;

            if (string.IsNullOrEmpty(userId)) return Unauthorized("User not authorized");

            var result = await dogService.UpdateDogAsync(userId, dogId, dogData);

            return result.Match<ActionResult>(
                onSuccess: NoContent,
                onFailure: error => NotFound(new ResponseModel { StatusCode = 404, Message = "Failed to update dog details.", ErrorList = [error] }));
        }

        // DELETE api/<DogsController>/5
        [HttpDelete("{dogId}")]
        public async Task<IActionResult> Delete([FromRoute] string dogId)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;
            var dog = await dogService.GetDogByIdAsync(dogId);
            if (dog == null)
                return NotFound($"Dog with id '{dogId}'");
            if (dog.OwnerId != userId)
                return BadRequest("Only the dog owner can delete a dog");

            await dogService.DeleteDogAsync(dogId);
            return Ok($"Dog with id '{dog.Id}' has been deleted");
        }

        // POST api/dogs/follow
        [HttpPost("follow")]
        public async Task<IActionResult> FollowDog([FromBody] FollowRequestDto followRequest)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;

            var response = await dogService.FollowDogAsync(userId, followRequest.FollowerDogId, followRequest.FollowingDogId);
            return StatusCode(response.StatusCode, response);
        }

        // POST api/dogs/unfollow
        [HttpPost("unfollow")]
        public async Task<IActionResult> UnfollowDog([FromBody] FollowRequestDto followRequest)
        {
            var userId = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ?? string.Empty;

            var response = await dogService.UnfollowDogAsync(userId, followRequest.FollowerDogId, followRequest.FollowingDogId);
            return StatusCode(response.StatusCode, response);
        }
    }
}