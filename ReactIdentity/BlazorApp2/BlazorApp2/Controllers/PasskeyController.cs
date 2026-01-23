using BlazorApp2.Data;
using BlazorApp2.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace BlazorApp2.Controllers
{
    [ApiController]
    [Route("api/auth/passkey")]
    public class PasskeyController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ILogger<PasskeyController> _logger;

        public PasskeyController(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ILogger<PasskeyController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _logger = logger;
        }

        [HttpPost("request-options")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> GetAssertionOptions([FromBody] PasskeyLoginRequest request)
        {
            try
            {
                // Look up user if email provided, otherwise use discoverable credentials
                ApplicationUser? user = null;
                if (!string.IsNullOrEmpty(request.Email))
                {
                    user = await _userManager.FindByEmailAsync(request.Email);
                }

                // Use Identity's built-in method which stores the challenge state
                // required for PasskeySignInAsync to work
                var optionsJson = await _signInManager.MakePasskeyRequestOptionsAsync(user);

                // Return the JSON directly as the response
                return Content(optionsJson, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating passkey assertion options");
                return BadRequest(ApiResponse.Failure("Failed to generate passkey options"));
            }
        }

        [HttpPost("authenticate")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Authenticate([FromBody] PasskeyAuthenticateRequest request)
        {
            try
            {
                // Convert the request back to the JSON format expected by Identity
                var credentialJson = JsonSerializer.Serialize(new
                {
                    id = request.Id,
                    rawId = request.RawId,
                    response = new
                    {
                        clientDataJSON = request.Response.ClientDataJSON,
                        authenticatorData = request.Response.AuthenticatorData,
                        signature = request.Response.Signature,
                        userHandle = request.Response.UserHandle
                    },
                    type = request.Type,
                    authenticatorAttachment = request.AuthenticatorAttachment,
                    clientExtensionResults = request.ClientExtensionResults ?? new { }
                });

                var result = await _signInManager.PasskeySignInAsync(credentialJson);

                if (result.Succeeded)
                {
                    _logger.LogInformation("User logged in with passkey");
                    return Ok(new LoginResponse { Succeeded = true });
                }

                if (result.RequiresTwoFactor)
                {
                    return Ok(new LoginResponse { Succeeded = false, RequiresTwoFactor = true });
                }

                if (result.IsLockedOut)
                {
                    _logger.LogWarning("User account locked out during passkey login");
                    return Ok(new LoginResponse { Succeeded = false, IsLockedOut = true });
                }

                return Ok(new LoginResponse { Succeeded = false, Message = "Passkey authentication failed" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during passkey authentication");
                return Ok(new LoginResponse { Succeeded = false, Message = "Passkey authentication failed" });
            }
        }

        [HttpPost("creation-options")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> GetCreationOptions()
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized();
                }

                // Use Identity's built-in method which stores the challenge state
                // required for PerformPasskeyAttestationAsync to work
                var optionsJson = await _signInManager.MakePasskeyCreationOptionsAsync(new PasskeyUserEntity
                {
                    Id = user.Id,
                    Name = user.Email ?? user.UserName ?? "User",
                    DisplayName = user.Email ?? user.UserName ?? "User"
                });

                // Return the JSON directly as the response
                return Content(optionsJson, "application/json");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating passkey creation options");
                return BadRequest(ApiResponse.Failure("Failed to generate passkey creation options"));
            }
        }

        [HttpPost("register")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Register([FromBody] PasskeyRegisterRequest request)
        {
            try
            {
                var user = await _userManager.GetUserAsync(User);
                if (user == null)
                {
                    return Unauthorized();
                }

                // Convert the request back to the JSON format expected by Identity
                var credentialJson = JsonSerializer.Serialize(new
                {
                    id = request.Id,
                    rawId = request.RawId,
                    response = new
                    {
                        clientDataJSON = request.Response.ClientDataJSON,
                        attestationObject = request.Response.AttestationObject,
                        transports = request.Response.Transports
                    },
                    type = request.Type,
                    authenticatorAttachment = request.AuthenticatorAttachment,
                    clientExtensionResults = request.ClientExtensionResults ?? new { }
                });

                var attestationResult = await _signInManager.PerformPasskeyAttestationAsync(credentialJson);
                if (!attestationResult.Succeeded)
                {
                    return Ok(ApiResponse.Failure(attestationResult.Failure?.Message ?? "Passkey registration failed"));
                }

                var addResult = await _userManager.AddOrUpdatePasskeyAsync(user, attestationResult.Passkey);
                if (!addResult.Succeeded)
                {
                    var errors = string.Join(", ", addResult.Errors.Select(e => e.Description));
                    return Ok(ApiResponse.Failure(errors));
                }

                _logger.LogInformation("User {UserId} registered a new passkey", user.Id);
                return Ok(ApiResponse.Success("Passkey registered successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during passkey registration");
                return Ok(ApiResponse.Failure("Passkey registration failed"));
            }
        }

        [HttpGet("list")]
        [Authorize]
        public async Task<IActionResult> List()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            var passkeys = await _userManager.GetPasskeysAsync(user);
            var result = passkeys.Select(p => new PasskeyInfo
            {
                Id = Convert.ToBase64String(p.CredentialId)
                    .TrimEnd('=')
                    .Replace('+', '-')
                    .Replace('/', '_'),
                Name = p.Name,
                CreatedAt = p.CreatedAt
            }).ToList();

            return Ok(result);
        }

        [HttpPost("delete")]
        [ValidateAntiForgeryToken]
        [Authorize]
        public async Task<IActionResult> Delete([FromBody] PasskeyDeleteRequest request)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return Unauthorized();
            }

            try
            {
                // Decode the base64url credential ID
                var idBase64 = request.Id
                    .Replace('-', '+')
                    .Replace('_', '/');

                // Add padding if needed
                switch (idBase64.Length % 4)
                {
                    case 2: idBase64 += "=="; break;
                    case 3: idBase64 += "="; break;
                }

                var credentialId = Convert.FromBase64String(idBase64);
                var result = await _userManager.RemovePasskeyAsync(user, credentialId);

                if (result.Succeeded)
                {
                    _logger.LogInformation("User {UserId} deleted a passkey", user.Id);
                    return Ok(ApiResponse.Success("Passkey deleted"));
                }

                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return Ok(ApiResponse.Failure(errors));
            }
            catch (FormatException)
            {
                return BadRequest(ApiResponse.Failure("Invalid passkey ID format"));
            }
        }
    }
}
