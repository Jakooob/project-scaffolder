using BlazorApp2.Data;
using BlazorApp2.Models;
using BlazorApp2.Services;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using System.Security.Cryptography;

namespace BlazorApp2.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IEmailSender<ApplicationUser> _emailSender;
        private readonly IdentityNoOpEmailSender _noOpEmailSender;
        private readonly IAntiforgery _antiforgery;
        private readonly IDistributedCache _cache;
        private readonly ILogger<AuthController> _logger;

        private const string PasskeyVerificationCodePrefix = "PasskeyVerificationCode:";
        private static readonly TimeSpan VerificationCodeExpiry = TimeSpan.FromMinutes(10);

        public AuthController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IEmailSender<ApplicationUser> emailSender,
            IdentityNoOpEmailSender noOpEmailSender,
            IAntiforgery antiforgery,
            IDistributedCache cache,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _emailSender = emailSender;
            _noOpEmailSender = noOpEmailSender;
            _antiforgery = antiforgery;
            _cache = cache;
            _logger = logger;
        }

        private static string GenerateVerificationCode()
        {
            return RandomNumberGenerator.GetInt32(100000, 1000000).ToString();
        }

        [HttpGet("antiforgery")]
        public IActionResult GetAntiforgeryToken()
        {
            var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
            return Ok(new AntiforgeryTokenResponse { Token = tokens.RequestToken ?? string.Empty });
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            return Ok(new UserInfo
            {
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                TwoFactorEnabled = user.TwoFactorEnabled,
                PreferredTwoFactorMethod = (int)user.PreferredTwoFactorMethod
            });
        }

        [HttpPost("login")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new LoginResponse { Succeeded = false, Message = "Invalid request" });
            }

            var result = await _signInManager.PasswordSignInAsync(
                request.Email,
                request.Password,
                request.RememberMe,
                lockoutOnFailure: true);

            if (result.Succeeded)
            {
                _logger.LogInformation("User {Email} logged in", request.Email);
                return Ok(new LoginResponse { Succeeded = true });
            }

            if (result.RequiresTwoFactor)
            {
                var user = await _userManager.FindByEmailAsync(request.Email);
                if (user != null && user.PreferredTwoFactorMethod == TwoFactorMethod.Email)
                {
                    var code = await _userManager.GenerateTwoFactorTokenAsync(user, TokenOptions.DefaultEmailProvider);
                    await _noOpEmailSender.SendTwoFactorCodeAsync(user, user.Email!, code);
                }
                return Ok(new LoginResponse { Succeeded = false, RequiresTwoFactor = true });
            }

            if (result.IsLockedOut)
            {
                _logger.LogWarning("User {Email} is locked out", request.Email);
                return Ok(new LoginResponse { Succeeded = false, IsLockedOut = true });
            }

            if (result.IsNotAllowed)
            {
                return Ok(new LoginResponse { Succeeded = false, IsNotAllowed = true });
            }

            return Ok(new LoginResponse { Succeeded = false, Message = "Invalid login attempt" });
        }

        [HttpPost("register")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = new ApplicationUser { UserName = request.Email, Email = request.Email };
            var result = await _userManager.CreateAsync(user, request.Password);

            if (result.Succeeded)
            {
                _logger.LogInformation("User {Email} created a new account", request.Email);

                var code = await _userManager.GenerateEmailConfirmationTokenAsync(user);
                var callbackUrl = Url.Action("ConfirmEmail", "Auth",
                    new { userId = user.Id, code },
                    Request.Scheme);

                await _emailSender.SendConfirmationLinkAsync(user, user.Email!, callbackUrl ?? string.Empty);

                return Ok(ApiResponse.Success("Registration successful. Please check your email to confirm your account."));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            return Ok(ApiResponse.Failure(errors));
        }

        [HttpGet("confirm-email")]
        public async Task<IActionResult> ConfirmEmail(string userId, string code)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(code))
            {
                return Redirect("/login?error=invalid-confirmation-link");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Redirect("/login?error=user-not-found");
            }

            var result = await _userManager.ConfirmEmailAsync(user, code);
            if (result.Succeeded)
            {
                return Redirect("/login?message=email-confirmed");
            }

            return Redirect("/login?error=email-confirmation-failed");
        }

        [HttpPost("logout")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _signInManager.SignOutAsync();
            _logger.LogInformation("User logged out");
            return Ok(ApiResponse.Success());
        }

        [HttpPost("email/change")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
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

            if (user.Email == request.NewEmail)
            {
                return Ok(ApiResponse.Failure("New email is the same as current email"));
            }

            var existingUser = await _userManager.FindByEmailAsync(request.NewEmail);
            if (existingUser != null)
            {
                return Ok(ApiResponse.Failure("Email is already in use"));
            }

            var code = await _userManager.GenerateChangeEmailTokenAsync(user, request.NewEmail);
            var callbackUrl = Url.Action("ConfirmEmailChange", "Auth",
                new { userId = user.Id, email = request.NewEmail, code },
                Request.Scheme);

            await _emailSender.SendConfirmationLinkAsync(user, request.NewEmail, callbackUrl ?? string.Empty);

            _logger.LogInformation("User {UserId} requested email change to {NewEmail}", user.Id, request.NewEmail);
            return Ok(ApiResponse.Success("Verification email sent. Please check your inbox."));
        }

        [HttpPost("register-with-passkey")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> RegisterWithPasskey([FromBody] RegisterWithPasskeyRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                // Don't reveal that user exists for security
                return Ok(ApiResponse<RegisterWithPasskeyResponse>.Success(
                    new RegisterWithPasskeyResponse { UserId = Guid.NewGuid().ToString() },
                    "A verification code has been sent to your email."));
            }

            // Create user without password
            var user = new ApplicationUser { UserName = request.Email, Email = request.Email };
            var result = await _userManager.CreateAsync(user);

            if (result.Succeeded)
            {
                _logger.LogInformation("User {Email} created a new account with passkey registration", request.Email);

                // Generate a 6-digit verification code
                var verificationCode = GenerateVerificationCode();

                // Store the code in cache
                var cacheKey = $"{PasskeyVerificationCodePrefix}{user.Id}";
                await _cache.SetStringAsync(cacheKey, verificationCode, new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = VerificationCodeExpiry
                });

                // Send the code via email
                await _noOpEmailSender.SendEmailVerificationCodeAsync(user, user.Email!, verificationCode);

                return Ok(ApiResponse<RegisterWithPasskeyResponse>.Success(
                    new RegisterWithPasskeyResponse { UserId = user.Id },
                    "A verification code has been sent to your email."));
            }

            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Failed to create passkey user: {Errors}", errors);
            return Ok(ApiResponse.Failure(errors));
        }

        [HttpPost("verify-passkey-email")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> VerifyPasskeyEmail([FromBody] VerifyPasskeyEmailRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null)
            {
                return Ok(ApiResponse.Failure("Invalid verification code."));
            }

            // Check the verification code from cache
            var cacheKey = $"{PasskeyVerificationCodePrefix}{user.Id}";
            var storedCode = await _cache.GetStringAsync(cacheKey);

            if (string.IsNullOrEmpty(storedCode) || storedCode != request.Code)
            {
                _logger.LogWarning("Invalid or expired verification code for user {UserId}", user.Id);
                return Ok(ApiResponse.Failure("Invalid or expired verification code."));
            }

            // Mark email as confirmed
            user.EmailConfirmed = true;
            await _userManager.UpdateAsync(user);

            // Remove the code from cache
            await _cache.RemoveAsync(cacheKey);

            // Generate a passkey setup token
            var setupToken = await _userManager.GenerateUserTokenAsync(user, TokenOptions.DefaultProvider, "setup-passkey");

            _logger.LogInformation("User {UserId} verified email for passkey registration", user.Id);

            return Ok(ApiResponse<VerifyPasskeyEmailResponse>.Success(
                new VerifyPasskeyEmailResponse { UserId = user.Id, SetupToken = setupToken },
                "Email verified successfully."));
        }

        [HttpPost("resend-passkey-verification")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResendPasskeyVerification([FromBody] ResendPasskeyVerificationRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiResponse.Failure("Invalid request"));
            }

            var user = await _userManager.FindByIdAsync(request.UserId);
            if (user == null || user.EmailConfirmed)
            {
                // Don't reveal user state
                return Ok(ApiResponse.Success("If the account exists and is pending verification, a new code has been sent."));
            }

            // Generate a new 6-digit verification code
            var verificationCode = GenerateVerificationCode();

            // Store the code in cache (overwrites previous)
            var cacheKey = $"{PasskeyVerificationCodePrefix}{user.Id}";
            await _cache.SetStringAsync(cacheKey, verificationCode, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = VerificationCodeExpiry
            });

            // Send the code via email
            await _noOpEmailSender.SendEmailVerificationCodeAsync(user, user.Email!, verificationCode);

            _logger.LogInformation("Resent verification code to user {UserId}", user.Id);

            return Ok(ApiResponse.Success("A new verification code has been sent to your email."));
        }

        [HttpGet("confirm-email-change")]
        public async Task<IActionResult> ConfirmEmailChange(string userId, string email, string code)
        {
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(email) || string.IsNullOrEmpty(code))
            {
                return Redirect("/settings/email?error=invalid-confirmation-link");
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Redirect("/settings/email?error=user-not-found");
            }

            var result = await _userManager.ChangeEmailAsync(user, email, code);
            if (result.Succeeded)
            {
                // Also update username to match email
                await _userManager.SetUserNameAsync(user, email);
                _logger.LogInformation("User {UserId} changed email to {Email}", user.Id, email);
                return Redirect("/settings/email?message=email-changed");
            }

            return Redirect("/settings/email?error=email-change-failed");
        }
    }
}
