using Microsoft.AspNetCore.Identity;

namespace BlazorApp2.Data
{
    public enum TwoFactorMethod
    {
        None = 0,
        Authenticator = 1,
        Email = 2
    }

    // Add profile data for application users by adding properties to the ApplicationUser class
    public class ApplicationUser : IdentityUser
    {
        public TwoFactorMethod PreferredTwoFactorMethod { get; set; } = TwoFactorMethod.None;
    }
}
