namespace Dogli.Api.Models.DTOs
{
    public record DogDto(string Name, string? Breed, DateOnly? BirthDate, string? Gender, string? Description);
}