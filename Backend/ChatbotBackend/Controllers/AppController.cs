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
        private readonly ChatbotCoordinator _chatbotCoordinator;

        public AppController(ILogger<AppController> logger, LLMService llmService, ChatbotCoordinator chatbotCoordinator)
        {
            _logger = logger;
            _llmService = llmService;
            _chatbotCoordinator = chatbotCoordinator;
        }

        [HttpPost("Chat")]
        public async Task<IActionResult> PostChat([FromBody] ChatMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(message.Text))
            {
                return BadRequest("Message is required.");
            }

            // Get userId from the message or from authentication context
            // For now, we'll use the userId from the message, but in a real app
            // you'd get this from the authenticated user context
            
            Console.WriteLine($"User: {message.Text}");

            // Route the message through the coordinator
            var response = await _chatbotCoordinator.ProcessChatMessage(message.UserId, message.Text);

            Console.WriteLine($"Chatbot: {response}");
            return Ok(new { response });
        }
    }
}