using Dogli.Api.Models;

namespace Dogli.Api.Extensions
{
    public static class ResultExtensions
    {
        public static T Match<T>(
            this Result result,
            Func<T> onSuccess,
            Func<Error, T> onFailure) => result.IsSuccess ? onSuccess() : onFailure(result.Error);
    }
}