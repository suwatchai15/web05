using System.Security;
using System.Text;
using MassagePlatform.WebApi.Controllers;
using Microsoft.AspNetCore.Identity;

if (!Console.IsInputRedirected)
    Console.Error.Write("Platform admin password: ");
var password = ReadPassword();
if (string.IsNullOrWhiteSpace(password))
{
    Console.Error.WriteLine("Password must not be empty.");
    return 1;
}

var hasher = new PasswordHasher<PlatformCredential>();
Console.WriteLine(hasher.HashPassword(new PlatformCredential(), password));
return 0;

static string ReadPassword()
{
    if (Console.IsInputRedirected)
        return Console.ReadLine() ?? string.Empty;

    var password = new StringBuilder();
    while (true)
    {
        var key = Console.ReadKey(intercept: true);
        if (key.Key == ConsoleKey.Enter)
        {
            Console.WriteLine();
            break;
        }

        if (key.Key == ConsoleKey.Backspace)
        {
            if (password.Length > 0)
                password.Length--;
            continue;
        }

        if (!char.IsControl(key.KeyChar))
            password.Append(key.KeyChar);
    }

    return password.ToString();
}
