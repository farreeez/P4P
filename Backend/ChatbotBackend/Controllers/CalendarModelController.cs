using ChatbotBackend.Model;
using ChatbotBackend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("api/calendar")]
    public class CalendarController : ControllerBase
    {
        private readonly ICalendarRepository _calendarRepository;
        private readonly IUserRepository _userRepository;
        private readonly ILogger<CalendarController> _logger;

        public CalendarController(ICalendarRepository calendarRepository, IUserRepository userRepository, ILogger<CalendarController> logger)
        {
            _calendarRepository = calendarRepository;
            _userRepository = userRepository;
            _logger = logger;
        }

        /// <summary>
        /// Get all calendar events for a user
        /// </summary>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetCalendarEventsByUserId(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var events = await _calendarRepository.GetByUserIdAsync(userId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching calendar events for user: {UserId}", userId);
                return StatusCode(500, new
                {
                    message = "Error fetching calendar events",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get a calendar event by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCalendarEventById(string id)
        {
            try
            {
                var calendarEvent = await _calendarRepository.GetByIdAsync(id);
                if (calendarEvent == null)
                {
                    return NotFound(new { message = "Event not found" });
                }
                return Ok(calendarEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching calendar event with ID: {EventId}", id);
                return StatusCode(500, new
                {
                    message = "Error fetching calendar event",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Create a new calendar event and add it to a user
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateCalendarEvent([FromBody] CreateCalendarEventRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Check if user exists
                var user = await _userRepository.GetByIdAsync(request.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var newEvent = new Calendar
                {
                    EventName = request.EventName,
                    EventDescription = request.EventDescription,
                    EventDate = request.EventDate,
                    StartTime = request.StartTime,
                    EndTime = request.EndTime,
                    Category = request.Category,
                    UserId = request.UserId
                };

                var createdEvent = await _calendarRepository.CreateAsync(newEvent);

                // Add the event ID to the user's calendarItems array
                user.CalendarItems.Add(createdEvent.Id!);
                await _userRepository.UpdateAsync(user);

                return Ok(new CreateCalendarEventResponse
                {
                    Message = "Event created and added to user successfully",
                    Event = createdEvent
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating calendar event");
                return StatusCode(500, new
                {
                    message = "Error creating event and adding to user",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Update a calendar event
        /// </summary>
        [HttpPut("{calendarId}")]
        public async Task<IActionResult> UpdateCalendarEvent(string calendarId, [FromBody] UpdateCalendarEventRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var existingEvent = await _calendarRepository.GetByIdAsync(calendarId);
                if (existingEvent == null)
                {
                    return NotFound(new { message = "Event not found" });
                }

                // Update the event properties
                existingEvent.EventName = request.EventName;
                existingEvent.EventDescription = request.EventDescription;
                existingEvent.EventDate = request.EventDate;
                existingEvent.StartTime = request.StartTime;
                existingEvent.EndTime = request.EndTime;
                existingEvent.Category = request.Category;

                var updatedEvent = await _calendarRepository.UpdateAsync(existingEvent);
                if (updatedEvent == null)
                {
                    return NotFound(new { message = "Event not found" });
                }

                return Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating calendar event with ID: {CalendarId}", calendarId);
                return StatusCode(500, new
                {
                    message = "Error updating calendar event",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Delete a calendar event
        /// </summary>
        [HttpDelete("{calendarId}")]
        public async Task<IActionResult> DeleteCalendarEvent(string calendarId)
        {
            try
            {
                var existingEvent = await _calendarRepository.GetByIdAsync(calendarId);
                if (existingEvent == null)
                {
                    return NotFound(new { message = "Event not found" });
                }

                var deleted = await _calendarRepository.DeleteAsync(calendarId);
                if (!deleted)
                {
                    return NotFound(new { message = "Event not found" });
                }

                // Remove the event ID from the user's calendarItems array
                var user = await _userRepository.GetByIdAsync(existingEvent.UserId);
                if (user != null)
                {
                    user.CalendarItems.Remove(calendarId);
                    await _userRepository.UpdateAsync(user);
                }

                return Ok(new { message = "Event deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting calendar event with ID: {CalendarId}", calendarId);
                return StatusCode(500, new
                {
                    message = "Error deleting calendar event",
                    error = ex.Message
                });
            }
        }

        /// <summary>
        /// Get unfinished calendar events for a user
        /// </summary>
        [HttpGet("unfinishedEvents/{userId}")]
        public async Task<IActionResult> GetUnfinishedEventsByUserId(string userId)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var events = await _calendarRepository.GetUnfinishedEventsByUserIdAsync(userId);
                return Ok(events);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching unfinished calendar events for user: {UserId}", userId);
                return StatusCode(500, new
                {
                    message = "Error fetching calendar events",
                    error = ex.Message
                });
            }
        }
    }
}