namespace Dogli.Api.Extensions
{
    public interface IEncryptor
    {
        string GetSalt();

        string GetHash(string value, string salt);
    }
}