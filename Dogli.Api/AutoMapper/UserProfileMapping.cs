using AutoMapper;
using Dogli.Api.Models;
using Dogli.Api.Models.DTOs;

namespace Dogli.Api.AutoMapper
{
    public class UserProfileMapping : Profile
    {
        public UserProfileMapping()
        {
            CreateMap<User, UserProfileDto>();
            CreateMap<UserProfileDto, User>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}