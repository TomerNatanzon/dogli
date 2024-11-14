using Dogli.Api.Extensions;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver.Linq;
using MongoDbGenericRepository.Attributes;
using System.Text.Json.Serialization;

namespace Dogli.Api.Models;

[CollectionName("users")]
public class User
{
    public static readonly string DocumentName = nameof(User);

    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; internal set; }

    [BsonElement("username")]
    public required string Username { get; init; }

    [BsonElement("email")]
    public required string Email { get; init; }

    [BsonElement("password_hash")]
    public string? Password { get; set; }

    [BsonElement("full_name")]
    public string? FullName { get; set; }

    [BsonElement("phone_number")]
    public string? PhoneNumber { get; internal set; }

    [BsonElement("birthdate")]
    [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
    public DateTime? Birthdate { get; internal set; }

    [BsonElement("gender")]
    public string? Gender { get; internal set; }

    [BsonElement("profileImageUrl")]
    public string? ProfileImageUrl { get; set; } =
        "https://firebasestorage.googleapis.com/v0/b/dogli-app.appspot.com/o/users%2Fmale-default-profile-image.png?alt=media&token=c5f87ee0-1dc8-411f-999c-3b7187c213f7";

    [JsonIgnore]
    public string? Salt { get; internal set; }

    public void SetPassword(string password, IEncryptor encryptor)
    {
        Salt = encryptor.GetSalt();
        Password = encryptor.GetHash(password, Salt);
    }

    public bool ValidatePassword(string password, IEncryptor encryptor) =>
        Password == encryptor.GetHash(password, Salt ?? encryptor.GetSalt());
}