using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Dogli.Api.Extensions;
using Dogli.Api.Repositories;
using Dogli.Api.Repositories.Interfaces;
using Dogli.Api.Services;
using Dogli.Api.Services.Interfaces;
using MongoDB.Driver;
using Serilog;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;

var builder = WebApplication.CreateBuilder(args);

// Configure JWT authentication
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"];
builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey))
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", policy =>
        policy.RequireAssertion(context =>
        {
            var role = context.User.FindFirstValue(JwtRegisteredClaimNames.Role);
            return role != null && role.Equals("Admin", StringComparison.OrdinalIgnoreCase);
        }));

// Add services to the container.

// MongoDB Configuration
var mongoClient = new MongoClient(builder.Configuration["MongoDBSettings:ConnectionString"]);
var mongoDatabase = mongoClient.GetDatabase(builder.Configuration["MongoDBSettings:DatabaseName"]);
builder.Services.AddSingleton(mongoDatabase);
builder.Services.AddScoped<IEncryptor, Encryptor>();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDogRepository, DogRepository>();
builder.Services.AddScoped<IParkRepository, ParkRepository>();
builder.Services.AddScoped<ICheckInRepository, CheckInRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
// Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IDogService, DogService>();
builder.Services.AddScoped<IParkService, ParkService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddTransient<IJwtAuthService, JwtAuthService>();
builder.Services.AddHttpClient<IGooglePlacesService, GooglePlacesService>();

builder.Services.AddRouting(options => options.LowercaseUrls = true);

builder.Services.AddControllers();
builder.Services.AddAutoMapper(typeof(Program).Assembly);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Dogli API", Version = "v1" });
    c.SchemaFilter<SwaggerExampleSchemaFilter>();

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "JWT Authentication",
        Description = "Enter your JWT token in this field",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    };

    c.AddSecurityDefinition("Bearer", securityScheme);

    var securityRequirement = new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    };

    c.AddSecurityRequirement(securityRequirement);
});

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .WriteTo.Console()
    .CreateLogger();

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Dogli API v1"));
}

// ExceptionHandlingMiddleware for Global Exception Handling
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseHttpsRedirection();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();