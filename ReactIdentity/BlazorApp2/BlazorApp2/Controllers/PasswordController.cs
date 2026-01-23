using BlazorApp2.Data;
using BlazorApp2.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using System.Text;

namespace BlazorApp2.Controllers
{
    [ApiController]
    [Route("api/auth/password")]
    public class PasswordController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailSender<ApplicationUser> _emailSender;
        private readonly ILogger<PasswordController> _logger;

        public PasswordController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailSender<ApplicationUser> emailSender,
            ILogger<PasswordController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _logger = logger;
        }

        [HttpPost("change")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (result.Succeeded)
            {
                await _signInManager.RefreshSignInAsync(user);
                _logger.LogInformation("User {UserId} changed their password", user.Id);
                return Ok(ApiResponse.Success("Password changed successfully"));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Ok(ApiResponse.Failure(errors));
        }

        [HttpPost("forgot")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.IsEmailConfirmedAsync(user))
            {
                // Don't reveal that the user does not exist or is not confirmed
                return Ok(ApiResponse.Success());
            }

            var code = await _userManager.GeneratePasswordResetTokenAsync(user);
            code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

            var callbackUrl = $"{Request.Scheme}://{Request.Host}/reset-password?email={Uri.EscapeDataString(request.Email)}&code={code}";

            await _emailSender.SendPasswordResetLinkAsync(user, user.Email!, callbackUrl);

            _logger.LogInformation("Password reset email sent to {Email}", request.Email);
            return Ok(ApiResponse.Success());
        }

        [HttpPost("reset")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                // Don't reveal that the user does not exist
                return Ok(ApiResponse.Success("Password has been reset"));
            }

            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
            var result = await _userManager.ResetPasswordAsync(user, code, request.Password);

            if (result.Succeeded)
            {
                _logger.LogInformation("Password reset for user {Email}", request.Email);
                return Ok(ApiResponse.Success("Password has been reset"));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Ok(ApiResponse.Failure(errors));
        }
    }
}
