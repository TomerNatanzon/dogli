using Dogli.Api.Models;
using FluentValidation;

namespace Dogli.Api.Validators
{
    public class UserValidator : AbstractValidator<User>
    {
        public UserValidator()
        {
            RuleFor(u => u.Username).NotEmpty();
            RuleFor(u => u.Email).EmailAddress();
            RuleFor(u => u.Password)
                .MinimumLength(8)
                .Matches("[A-Z]").WithMessage("Password must contain a capital letter");
        }
    }
}