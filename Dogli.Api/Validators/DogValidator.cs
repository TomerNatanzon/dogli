using Dogli.Api.Models;
using FluentValidation;

namespace Dogli.Api.Validators
{
    public class DogValidator : AbstractValidator<Dog>
    {
        public DogValidator()
        {
            RuleFor(dog => dog.Name).NotEmpty().WithMessage("Dog name cannot be empty");
        }
    }
}