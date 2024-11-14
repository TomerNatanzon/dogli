using Dogli.Api.Models;
using System.Text.Json;
using Dogli.Api.Services.Interfaces;

public class GooglePlacesService : IGooglePlacesService
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;

    public GooglePlacesService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["GoogleApi:ApiKey"];
    }

    public async Task<Park?> GetParkDetailsAsync(string placeId)
    {
        var url = $"https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&key={_apiKey ?? string.Empty}";

        var response = await _httpClient.GetAsync(url);
        response.EnsureSuccessStatusCode();

        var content = await response.Content.ReadAsStringAsync();
        var placeDetails = JsonSerializer.Deserialize<GooglePlaceResponse>(content);

        if (placeDetails?.Result == null)
        {
            return null;
        }

        var result = placeDetails.Result;

        return new Park
        {
            Name = result.Name,
            Address = result.FormattedAddress,
            Latitude = result.Geometry.Location.Lat,
            Longitude = result.Geometry.Location.Lng,
            PlaceId = placeId
        };
    }

    public async Task<List<Park>> GetNearbyDogParksAsync(double latitude, double longitude, int radius)
    {
        var parks = new List<Park>();
        var nextPageToken = string.Empty;
        var pagesCount = 0;

        do
        {
            var url = $"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={latitude},{longitude}&radius={radius}&type=park&keyword=גינת+כלבים&key={_apiKey}";

            if (!string.IsNullOrEmpty(nextPageToken))
            {
                url += $"&pagetoken={nextPageToken}";
            }

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            var googlePlacesResponse = JsonSerializer.Deserialize<GooglePlaceResponse>(content);

            if (googlePlacesResponse?.Results != null)
            {
                parks.AddRange(googlePlacesResponse.Results.Select(result => new Park
                {
                    Name = result.Name,
                    Address = result.Vicinity,
                    Latitude = result.Geometry.Location.Lat,
                    Longitude = result.Geometry.Location.Lng,
                    PlaceId = result.PlaceId
                }));
            }

            nextPageToken = googlePlacesResponse?.NextPageToken;

            if (!string.IsNullOrEmpty(nextPageToken))
            {
                await Task.Delay(1000);
            }

        } while (++pagesCount < 3 && !string.IsNullOrEmpty(nextPageToken));

        return parks;
    }

}