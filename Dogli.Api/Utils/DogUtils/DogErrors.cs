using Dogli.Api.Models;

namespace Dogli.Api.Utils.DogUtils
{
    public static class DogErrors
    {
        public static Error NotFound(string dogId) => new(
            "Dogs.NotFound", $"The dog with Id '{dogId}' was not found");

        public static Error SelfFollow() => new(
            "Dogs.Follow.SelfFollow", "Self follow is not allowed");

        public static Error AlreadyFollowing(string dogId, string followId) => new(
            "Dogs.Follow.AlreadyFollowing", $"The dog with Id '{dogId}' is already following dog '{followId}'");
    }
}