using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    public class ChatMessage 
    {
        [Required]
        public required string Text { get; set; }
        
        public string? UserId { get; set; }
    }
}