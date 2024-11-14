using Dogli.Api.Enums;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDbGenericRepository.Attributes;

namespace Dogli.Api.Models;

[CollectionName("parks")]
public class Park
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("name")]
    public string? Name { get; set; }

    [BsonElement("address")]
    public string? Address { get; set; }

    [BsonElement("latitude")]
    public double Latitude { get; set; } 

    [BsonElement("longitude")]
    public double Longitude { get; set; } 

    [BsonElement("place_id")]
    public required string PlaceId { get; set; }

    [BsonElement("facilities")]
    public List<string> Facilities { get; set; } = [];

    [BsonElement("size")]
    [BsonRepresentation(BsonType.String)]
    public ParkSize? Size { get; init; } = ParkSize.Medium;

    [BsonElement("rating")]
    public double? Rating { get; internal set; } = null;

    [BsonElement("profileImageUrl")]
    public string? ProfileImageUrl { get; set; } =
        "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/parks%2Fdefault-park-picture.jpeg?alt=media&token=4ea7d09a-af50-48aa-918e-f858d819a674";

    [BsonElement("imageUrls")]
    public List<string> ImageUrls { get; set; } = [];
}