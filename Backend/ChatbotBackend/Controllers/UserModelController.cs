using ChatbotBackend.Model;
using ChatbotBackend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("api/user")]
    public class UserController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserRepository userRepository, ILogger<UserController> logger)
        {
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all users
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching users");
                return StatusCode(500, new
                {
                    message = "Error fetching users",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get a user by ID
        /// </summary>
        [HttpGet("{userId}")]
        public async Task<IActionResult> GetUserById(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user with ID: {UserId}", userId);
                return StatusCode(500, new
                {
                    message = "Error fetching user",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get a user by full name
        /// </summary>
        [HttpGet("name/{fullName}")]
        public async Task<IActionResult> GetUserByFullName(string fullName)
        {
            try
            {
                var user = await _userRepository.GetByFullNameAsync(fullName);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }
                return Ok(user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching user with full name: {FullName}", fullName);
                return StatusCode(500, new
                {
                    message = "Error fetching user",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Create a new user
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Check if user with email already exists
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return BadRequest(new { message = $"User with the email address \"{request.Email}\" already exists." });
                }

                var newUser = new User
                {
                    FullName = request.FullName,
                    Password = request.Password,
                    Email = request.Email,
                    CalendarItems = new List<string>()
                };

                var createdUser = await _userRepository.CreateAsync(newUser);
                return CreatedAtAction(nameof(GetUserById), new { userId = createdUser.Id }, createdUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new
                {
                    message = "Error creating user",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Authenticate a user
        /// </summary>
        [HttpPost("authenticate")]
        public async Task<IActionResult> AuthenticateUser([FromBody] AuthenticateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var user = await _userRepository.AuthenticateAsync(request.Email, request.Password);
                if (user == null)
                {
                    return Unauthorized(new { message = "Invalid credentials" });
                }

                return Ok(new AuthenticateResponse
                {
                    Message = "Authenticated successfully",
                    User = user
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error authenticating user");
                return StatusCode(500, new
                {
                    message = "Error authenticating user",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Update user details - fullname, email and password
        /// </summary>
        [HttpPut("{userId}/details")]
        public async Task<IActionResult> UpdateUserDetails(string userId, [FromBody] UpdateUserDetailsRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingUser = await _userRepository.GetByIdAsync(userId);
                if (existingUser == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Update the user properties
                existingUser.FullName = request.FullName;
                existingUser.Email = request.Email;
                existingUser.Password = request.Password;

                var updatedUser = await _userRepository.UpdateAsync(existingUser);
                if (updatedUser == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new
                {
                    message = "User details updated successfully",
                    user = updatedUser
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user details for ID: {UserId}", userId);
                return StatusCode(500, new
                {
                    message = "Error updating user details",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Delete a user by ID
        /// </summary>
        [HttpDelete("{userId}")]
        public async Task<IActionResult> DeleteUser(string userId)
        {
            try
            {
                var deleted = await _userRepository.DeleteAsync(userId);
                if (!deleted)
                {
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID: {UserId}", userId);
                return StatusCode(500, new
                {
                    message = "Error deleting user",
                    error = ex.Message
                });
            }
        }
    }
}