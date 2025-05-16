using System.ComponentModel.DataAnnotations;

namespace ChatbotBackend.Model
{
    public class ChatMessage 
    {
        public required string Text { get; set; }
    }
}
