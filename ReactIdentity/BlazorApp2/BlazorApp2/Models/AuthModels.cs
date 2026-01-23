using System.ComponentModel.DataAnnotations;

namespace BlazorApp2.Models
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        public bool RememberMe { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Code { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class Verify2faRequest
    {
        [Required]
        public string Code { get; set; } = string.Empty;
    }

    public class PasskeyLoginRequest
    {
        public string? Email { get; set; }
    }

    public class PasskeyAuthenticateRequest
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string RawId { get; set; } = string.Empty;

        [Required]
        public PasskeyAuthenticatorResponse Response { get; set; } = null!;

        [Required]
        public string Type { get; set; } = string.Empty;

        public string? AuthenticatorAttachment { get; set; }

        public object? ClientExtensionResults { get; set; }
    }

    public class PasskeyAuthenticatorResponse
    {
        [Required]
        public string ClientDataJSON { get; set; } = string.Empty;

        [Required]
        public string AuthenticatorData { get; set; } = string.Empty;

        [Required]
        public string Signature { get; set; } = string.Empty;

        public string? UserHandle { get; set; }
    }

    public class PasskeyRegisterRequest
    {
        [Required]
        public string Id { get; set; } = string.Empty;

        [Required]
        public string RawId { get; set; } = string.Empty;

        [Required]
        public PasskeyRegistrationResponse Response { get; set; } = null!;

        [Required]
        public string Type { get; set; } = string.Empty;

        public string? AuthenticatorAttachment { get; set; }

        public object? ClientExtensionResults { get; set; }
    }

    public class PasskeyRegistrationResponse
    {
        [Required]
        public string ClientDataJSON { get; set; } = string.Empty;

        [Required]
        public string AttestationObject { get; set; } = string.Empty;

        public string[]? Transports { get; set; }
    }

    public class LoginResponse
    {
        public bool Succeeded { get; set; }
        public bool RequiresTwoFactor { get; set; }
        public bool IsLockedOut { get; set; }
        public bool IsNotAllowed { get; set; }
        public string? Message { get; set; }
    }

    public class ApiResponse
    {
        public bool Succeeded { get; set; }
        public string? Message { get; set; }

        public static ApiResponse Success(string? message = null) => new() { Succeeded = true, Message = message };
        public static ApiResponse Failure(string message) => new() { Succeeded = false, Message = message };
    }

    public class ApiResponse<T> : ApiResponse
    {
        public T? Data { get; set; }

        public static ApiResponse<T> Success(T data, string? message = null) => new() { Succeeded = true, Data = data, Message = message };
        public new static ApiResponse<T> Failure(string message) => new() { Succeeded = false, Message = message };
    }

    public class UserInfo
    {
        public string Email { get; set; } = string.Empty;
        public bool EmailConfirmed { get; set; }
        public bool TwoFactorEnabled { get; set; }
        public int PreferredTwoFactorMethod { get; set; }
    }

    public class AntiforgeryTokenResponse
    {
        public string Token { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        [Required]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string NewPassword { get; set; } = string.Empty;

        [Required]
        [Compare("NewPassword")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class ChangeEmailRequest
    {
        [Required]
        [EmailAddress]
        public string NewEmail { get; set; } = string.Empty;
    }

    public class Enable2faRequest
    {
        [Required]
        public int Method { get; set; }
    }

    public class PasskeyDeleteRequest
    {
        [Required]
        public string Id { get; set; } = string.Empty;
    }

    public class PasskeyInfo
    {
        public string Id { get; set; } = string.Empty;
        public string? Name { get; set; }
        public DateTimeOffset CreatedAt { get; set; }
    }
}
