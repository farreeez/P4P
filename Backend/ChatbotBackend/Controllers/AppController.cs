using ChatbotBackend.Model;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AppController
        : ControllerBase
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

            // You'll need a way to identify the user/session.
            // For now, let's use a dummy ID or assume it comes from the message object.
            // In a real app, this would be from authentication or a session ID.
            string userId = "user123"; // Replace with actual user ID mechanism

            Console.WriteLine($"User: {message.Text}");

            // Route the message through the coordinator
            var response = await _chatbotCoordinator.ProcessChatMessage(userId, message.Text);

            Console.WriteLine($"Chatbot: {response}");
            return Ok(new { response });
        }

    }
}
