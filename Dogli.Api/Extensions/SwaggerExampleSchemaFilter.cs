using Dogli.Api.Models;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Dogli.Api.Extensions;

public class SwaggerExampleSchemaFilter : ISchemaFilter
{
    public void Apply(OpenApiSchema schema, SchemaFilterContext context)
    {
        if (context.Type != typeof(DateTime?)) return;
        schema.Format = "date";
        schema.Example = new OpenApiString("2024-01-01");
    }
}