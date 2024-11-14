using FluentValidation;
using System.Xml.Linq;

namespace Dogli.Api.Validators
{
    public static class MyCustomValidators
    {
        public static IRuleBuilderOptions<T, string> ListMustContainFewerThan<T>(this IRuleBuilder<T, string> ruleBuilder, List<string> options)
        {
            return ruleBuilder.Must(options.Contains).WithMessage("The list contains too many items");
        }
    }
}