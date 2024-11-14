namespace Dogli.Api.Models.DTOs
{
    public record UserProfileDto(string? FullName, string? PhoneNumber, DateTime? Birthdate, string? Gender, string? ProfileImageUrl, string? UserName);
}