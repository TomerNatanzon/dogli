using MongoDB.Driver;
using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.Net;
using Dogli.Api.Models;

namespace Dogli.Api.Extensions
{
    public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            string message;

            switch (exception)
            {
                case ValidationException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = "Validation error.";
                    break;

                case FormatException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = exception.Message;
                    break;

                case UnauthorizedAccessException:
                    context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    message = "Unauthorized access.";
                    break;

                case KeyNotFoundException:
                    context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                    message = "Resource not found.";
                    break;

                case ArgumentException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = "Invalid argument.";
                    break;

                case InvalidOperationException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = "Invalid operation.";
                    break;

                case MongoWriteException writeException when writeException.WriteError.Category == ServerErrorCategory.DuplicateKey:
                    context.Response.StatusCode = (int)HttpStatusCode.Conflict;
                    message = "A duplicate key error occurred.";
                    break;

                case MongoWriteConcernException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = "A write concern error occurred.";
                    break;

                case MongoCommandException:
                    context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                    message = "A command error occurred.";
                    break;

                case MongoConnectionException:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    message = exception.Message;
                    break;

                default:
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    message = "An unexpected error occurred.";
                    break;
            }

            var response = new ResponseModel()
            {
                StatusCode = context.Response.StatusCode,
                Message = message
            };

            logger.LogError(exception, response.ToString());

            await context.Response.WriteAsync(JsonConvert.SerializeObject(response));
        }
    }
}