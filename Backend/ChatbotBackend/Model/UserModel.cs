using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    public class User
    {
        public string? Id { get; set; }
        
        [Required]
        public required string FullName { get; set; }
        
        [Required]
        public required string Password { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        public List<string> CalendarItems { get; set; } = new List<string>();
    }

    public class CreateUserRequest
    {
        [Required]
        public required string FullName { get; set; }
        
        [Required]
        public required string Password { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
    }

    public class AuthenticateUserRequest
    {
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Password { get; set; }
    }

    public class UpdateUserDetailsRequest
    {
        [Required]
        public required string FullName { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Password { get; set; }
    }

    public class AuthenticateResponse
    {
        public required string Message { get; set; }
        public required User User { get; set; }
    }
}