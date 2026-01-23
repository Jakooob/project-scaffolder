using BlazorApp2.Data;
using BlazorApp2.Models;
using BlazorApp2.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BlazorApp2.Controllers
{
    [ApiController]
    [Route("api/auth/2fa")]
    public class TwoFactorController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IdentityNoOpEmailSender _emailSender;
        private readonly ILogger<TwoFactorController> _logger;

        public TwoFactorController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IdentityNoOpEmailSender emailSender,
            ILogger<TwoFactorController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _logger = logger;
        }

        [HttpPost("verify")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Verify([FromBody] Verify2faRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new LoginResponse { Succeeded = false, Message = "Invalid request" });
            }

            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return BadRequest(new LoginResponse { Succeeded = false, Message = "Unable to load two-factor authentication user" });
            }

            var authenticatorCode = request.Code.Replace(" ", string.Empty).Replace("-", string.Empty);

            // Try authenticator first, then email
            var result = await _signInManager.TwoFactorAuthenticatorSignInAsync(
                authenticatorCode,
                isPersistent: false,
                rememberClient: false);

            if (!result.Succeeded && user.PreferredTwoFactorMethod == TwoFactorMethod.Email)
            {
                result = await _signInManager.TwoFactorSignInAsync(
                    TokenOptions.DefaultEmailProvider,
                    authenticatorCode,
                    isPersistent: false,
                    rememberClient: false);
            }

            if (result.Succeeded)
            {
                _logger.LogInformation("User {UserId} logged in with 2fa", user.Id);
                return Ok(new LoginResponse { Succeeded = true });
            }

            if (result.IsLockedOut)
            {
                _logger.LogWarning("User {UserId} account locked out", user.Id);
                return Ok(new LoginResponse { Succeeded = false, IsLockedOut = true });
            }

            return Ok(new LoginResponse { Succeeded = false, Message = "Invalid authenticator code" });
        }

        [HttpPost("send-email-code")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendEmailCode()
        {
            var user = await _signInManager.GetTwoFactorAuthenticationUserAsync();
            if (user == null)
            {
                return BadRequest(ApiResponse.Failure("Unable to load user"));
            }

            var code = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
            await _emailSender.SendTwoFactorCodeAsync(user, user.Email!, code);

            _logger.LogInformation("2FA email code sent to user {UserId}", user.Id);
            return Ok(ApiResponse.Success("Verification code sent"));
        }

        [HttpPost("enable")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Enable([FromBody] Enable2faRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var method = (TwoFactorMethod)request.Method;
            if (method == TwoFactorMethod.None)
            {
                return BadRequest(ApiResponse.Failure("Invalid 2FA method"));
            }

            // Enable 2FA
            await _userManager.SetTwoFactorEnabledAsync(user, true);
            user.PreferredTwoFactorMethod = method;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} enabled 2FA with method {Method}", user.Id, method);
            return Ok(ApiResponse.Success("Two-factor authentication enabled"));
        }

        [HttpPost("disable")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Disable()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            await _userManager.SetTwoFactorEnabledAsync(user, false);
            user.PreferredTwoFactorMethod = TwoFactorMethod.None;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} disabled 2FA", user.Id);
            return Ok(ApiResponse.Success("Two-factor authentication disabled"));
        }

        [HttpPost("update-method")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> UpdateMethod([FromBody] Enable2faRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            if (!user.TwoFactorEnabled)
            {
                return BadRequest(ApiResponse.Failure("2FA is not enabled"));
            }

            var method = (TwoFactorMethod)request.Method;
            if (method == TwoFactorMethod.None)
            {
                return BadRequest(ApiResponse.Failure("Invalid 2FA method"));
            }

            user.PreferredTwoFactorMethod = method;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("User {UserId} updated 2FA method to {Method}", user.Id, method);
            return Ok(ApiResponse.Success("Preferred method updated"));
        }
    }
}
