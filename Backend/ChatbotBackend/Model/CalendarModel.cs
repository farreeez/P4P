using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    public class Calendar
    {
        public string? Id { get; set; }
        
        [Required]
        public required string EventName { get; set; }
        
        [Required]
        public required string EventDescription { get; set; }
        
        [Required]
        public required DateTime EventDate { get; set; }
        
        [Required]
        public required DateTime StartTime { get; set; }
        
        [Required]
        public required DateTime EndTime { get; set; }
        
        [Required]
        public required string Category { get; set; }
        
        [Required]
        public required string UserId { get; set; }
    }

    public class CreateCalendarEventRequest
    {
        [Required]
        public required string EventName { get; set; }
        
        [Required]
        public required string EventDescription { get; set; }
        
        [Required]
        public required DateTime EventDate { get; set; }
        
        [Required]
        public required DateTime StartTime { get; set; }
        
        [Required]
        public required DateTime EndTime { get; set; }
        
        [Required]
        public required string Category { get; set; }
        
        [Required]
        public required string UserId { get; set; }
    }

    public class UpdateCalendarEventRequest
    {
        [Required]
        public required string EventName { get; set; }
        
        [Required]
        public required string EventDescription { get; set; }
        
        [Required]
        public required DateTime EventDate { get; set; }
        
        [Required]
        public required DateTime StartTime { get; set; }
        
        [Required]
        public required DateTime EndTime { get; set; }
        
        [Required]
        public required string Category { get; set; }
    }

    public class CreateCalendarEventResponse
    {
        public required string Message { get; set; }
        public required Calendar Event { get; set; }
    }
}