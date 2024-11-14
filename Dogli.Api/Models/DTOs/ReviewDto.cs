using System.ComponentModel.DataAnnotations;

namespace Dogli.Api.Models.DTOs
{
    public record ReviewDto
    {
        public required string ParkPlaceId { get; set; }

        public string? Title { get; set; } = string.Empty;

        [Range(1, 5)]
        public required int Rating { get; set; }

        public string? Description { get; set; } = string.Empty;
    }
}