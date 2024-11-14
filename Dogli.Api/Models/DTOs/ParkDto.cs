namespace Dogli.Api.Models.DTOs
{
    public record ParkDto
    {
        public string Name { get; init; }
        public string Address { get; init; }
        public double Latitude { get; init; }
        public double Longitude { get; init; }
        public required string PlaceId { get; init; }
    }
}