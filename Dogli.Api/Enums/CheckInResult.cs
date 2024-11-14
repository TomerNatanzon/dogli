namespace Dogli.Api.Enums;

public enum CheckInResult
{
    Success,
    ParkNotFound,
    DogNotOwnedByUser,
    DistanceTooFar
}

public enum CheckOutResult
{
    Success,
    CheckInNotFound
}