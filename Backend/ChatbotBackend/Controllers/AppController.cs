using ChatbotBackend.Model;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AppController : ControllerBase
    {
        private readonly ILogger<AppController> _logger;
        private readonly LLMService _llmService;

        public AppController(ILogger<AppController> logger, LLMService llmService)
        {
            _logger = logger;
            _llmService = llmService;
        }

        [HttpPost("Chat")]
        public async Task<IActionResult> PostChat([FromBody] ChatMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
                
            Console.WriteLine("works");
            Console.WriteLine($"User: {message.Text}");
            
            if (string.IsNullOrWhiteSpace(message.Text))
            {
                return BadRequest("Message is required.");
            }

            // Get userId from the message or from authentication context
            // For now, we'll use the userId from the message, but in a real app
            // you'd get this from the authenticated user context
            var response = await _llmService.GetLLMResponseAsync(message.Text, message.UserId);
            
            Console.WriteLine($"Chatbot: {response}");
            return Ok(new { response });
        }
    }
}