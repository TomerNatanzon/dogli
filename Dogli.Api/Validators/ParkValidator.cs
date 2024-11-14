using Dogli.Api.Models;
using FluentValidation;

namespace Dogli.Api.Validators
{
    public class ParkValidator : AbstractValidator<Park>
    {
        public ParkValidator()
        {
            RuleFor(park => park.Name).NotNull();
        }
    }
}