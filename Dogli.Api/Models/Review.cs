using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDbGenericRepository.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.Configuration;
using Dogli.Api.Models.DTOs;

namespace Dogli.Api.Models
{
    [CollectionName("reviews")]
    public class Review
    {
        public static readonly string DocumentName = nameof(Review);

        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; internal set; }

        [BsonElement("user_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string UserId { get; set; }

        [BsonElement("user_profile")]
        public UserProfileDto? UserProfile { get; internal set; }

        [BsonElement("park_id")]
        [BsonRepresentation(BsonType.ObjectId)]
        public required string ParkId { get; set; }

        [Range(1, 5)]
        [BsonElement("rating")]
        public required int Rating { get; set; }

        [BsonElement("title")]
        public string? Title { get; set; } = string.Empty;

        [BsonElement("description")]
        public string? Description { get; set; } = string.Empty;

        [BsonElement("likes")]
        public List<string> Likes { get; set; } = [];

        [BsonElement("dislikes")]
        public List<string> Dislikes { get; set; } = [];

        [BsonElement("timestamps")]
        public Timestamps Timestamps { get; set; } = new();
    }
}