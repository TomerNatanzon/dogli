using Dogli.Api.Extensions;
using Dogli.Api.Models;
using Dogli.Api.Services.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Dogli.Api.Models.DTOs;
using AutoMapper;
using NuGet.Protocol.Core.Types;
using Dogli.Api.Services;
using System.IdentityModel.Tokens.Jwt;

namespace Dogli.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController(IUserService userService, IValidator<User> validator, IEncryptor encryptor, IJwtAuthService jwtAuthService, IMapper mapper) : ControllerBase
    {
        // GET api/users/usernames
        [HttpGet("usernames")]
        public async Task<IActionResult> GetUserByUsername()
        {
            var usernames = await userService.GetAllUsersAsync();
            return Ok(usernames.Select(user => user.Username).ToList());
        }

        // POST api/users/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto credentials)
        {
            var existingUser = await userService.GetUserByEmailAsync(credentials.Email);

            var isValid = existingUser?.ValidatePassword(credentials.Password ?? "", encryptor) ?? false;

            if (!isValid)
            {
                return Unauthorized("Could not authenticate user. Wrong Email or Password");
            }

            var token = jwtAuthService.GenerateToken(existingUser!);
            return Ok(new { Token = token, existingUser!.Id }); // JWT token with the user's claims
        }

        // POST api/users/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            var validationResult = await validator.ValidateAsync(user);

            if (!validationResult.IsValid)
            {
                return BadRequest(new ValidationProblemDetails(validationResult.ToDictionary()));
            }

            var existingUser = await userService.GetUserByEmailAsync(user.Email);
            if (existingUser != null)
            {
                return BadRequest("User with the same Email already exists.");
            }

            var existingUsername = await userService.GetUserByUsernameAsync(user.Username);
            if (existingUsername != null)
            {
                return BadRequest("User with the same Username already exists.");
            }

            user.SetPassword(user.Password!, encryptor);

            var createdUser = await userService.CreateUserAsync(user);
            if (createdUser == null)
            {
                return BadRequest("User registration failed.");
            }

            return Ok(new { createdUser.Id, createdUser.Email, createdUser.FullName });
        }

        // PUT api/users/profile
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfileDetails([FromBody] UserProfileDto profileDto)
        {
            var userIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub); 
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var user = await userService.GetUserByIdAsync(userIdClaim);
            if (user == null)
            {
                return NotFound();
            }

            var userName = user.Username;

            Console.WriteLine(userName);

            mapper.Map(profileDto, user);
            
            await userService.UpdateUserAsync(user);

            var updatedProfile = mapper.Map<UserProfileDto>(user);
            Console.WriteLine($"updated Profile: {updatedProfile}");
            return Ok(updatedProfile);
        }
        
        // GET api/users/profile
        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfileDetails()
        {
            var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var user = await userService.GetUserByIdAsync(userIdClaim);
            if (user == null)
            {
                return NotFound();
            }

            var userProfileDto = mapper.Map<UserProfileDto>(user);
            return Ok(userProfileDto);
        }
    }
}