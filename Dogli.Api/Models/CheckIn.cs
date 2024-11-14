using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDbGenericRepository.Attributes;
using NuGet.Packaging.Signing;
using System;

namespace Dogli.Api.Models
{
    [CollectionName("checkins")]
    public class CheckIn
    {
        public static readonly string DocumentName = nameof(CheckIn);

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; internal set; }

        [BsonElement("user_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string UserId { get; set; }

        [BsonElement("park_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string ParkId { get; set; }

        [BsonElement("dog_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string DogId { get; set; }

        [BsonElement("arrival_time")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime ArrivalTime { get; set; } = DateTime.UtcNow;

        [BsonElement("leave_time")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime? LeaveTime { get; set; }

        [BsonElement("is_active")]
        public bool IsActive { get; internal set; } = true;

        [BsonElement("timestamps")]
        public Timestamps Timestamps { get; set; } = new();
    }

    public class Timestamps
    {
        [BsonElement("created_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [BsonElement("updated_at")]
        [BsonDateTimeOptions(Kind = DateTimeKind.Utc)]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}