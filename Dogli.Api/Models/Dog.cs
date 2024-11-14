using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson.Serialization.Serializers;
using MongoDbGenericRepository.Attributes;
using System.ComponentModel;

namespace Dogli.Api.Models;

[CollectionName("dogs")]
public class Dog
{
    public static readonly string DocumentName = nameof(Dog);

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; internal set; }

    [BsonElement("name")]
    public required string Name { get; set; }

    [DefaultValue("other")]
    [BsonElement("breed")]
    public string Breed { get; set; } = "other";

    [BsonElement("birthdate")]
    [BsonDateTimeOptions(DateOnly = true)]
    public DateTime? BirthDate { get; set; }

    [BsonElement("gender")]
    public string? Gender { get; set; }

    [BsonElement("description")]
    public string? Description { get; set; }

    [BsonElement("owner_id")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? OwnerId { get; internal set; }

    [BsonElement("followers")]
    public List<string> Followers { get; internal set; } = [];

    [BsonElement("following")]
    public List<string> Following { get; internal set; } = [];

    [DefaultValue(false)]
    [BsonElement("is_spayed_or_neutered")]
    public bool? IsSpayedOrNeutered { get; set; }

    [BsonElement("weight")]
    public double? Weight { get; set; }

    [BsonElement("profileImageUrl")]
    public string? ProfileImageUrl { get; set; } =
        "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/dogs%2Fdefault-dog-picture.png?alt=media&token=6f3096ac-a38a-440b-bd86-3a072bba385f";
}