namespace Dogli.Api.Models.DTOs
{
    public record CheckInDto
    {
        public required string ParkPlaceId { get; init; }
        public required string DogId { get; init; }
        public double Latitude { get; init; }
        public double Longitude { get; init; }
    }
}