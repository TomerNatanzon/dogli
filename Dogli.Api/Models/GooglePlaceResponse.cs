#nullable disable
using System.Text.Json.Serialization;

namespace Dogli.Api.Models
{
    public class GooglePlaceResponse
    {
        [JsonPropertyName("result")]
        public PlaceResult Result { get; set; }

        [JsonPropertyName("results")]
        public List<GooglePlaceResult> Results { get; set; }

        [JsonPropertyName("next_page_token")]
        public string NextPageToken { get; set; }

        [JsonPropertyName("status")]
        public string Status { get; set; }
    }

    public class PlaceResult
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("formatted_address")]
        public string FormattedAddress { get; set; }

        [JsonPropertyName("geometry")]
        public Geometry Geometry { get; set; }
    }

    public class Geometry
    {
        [JsonPropertyName("location")]
        public Location Location { get; set; }
    }

    public class Location
    {
        [JsonPropertyName("lat")]
        public double Lat { get; set; }

        [JsonPropertyName("lng")]
        public double Lng { get; set; }
    }

    public class GooglePlaceResult
    {
        [JsonPropertyName("place_id")]
        public string PlaceId { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("vicinity")]
        public string Vicinity { get; set; }

        [JsonPropertyName("geometry")]
        public GooglePlaceGeometry Geometry { get; set; }
    }

    public class GooglePlaceGeometry
    {
        [JsonPropertyName("location")]
        public GooglePlaceLocation Location { get; set; }
    }

    public class GooglePlaceLocation
    {
        [JsonPropertyName("lat")]
        public double Lat { get; set; }

        [JsonPropertyName("lng")]
        public double Lng { get; set; }
    }
}