using ChatbotBackend.Model;
using Microsoft.AspNetCore.Mvc;
using ChatbotBackend.Services; // Ensure this is present
using System.Threading.Tasks;

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
                return BadRequest("Message is required.");

            // CRITICAL: Ensure the message.UserId is being passed from the client and is not null or whitespace.
            if (string.IsNullOrWhiteSpace(message.UserId))
            {
                return BadRequest("User ID is required.");
            }

            Console.WriteLine($"User: {message.UserId}, Message: {message.Text}");

            // The ChatbotCoordinator is responsible for processing the message and using the userId.
            var response = await _chatbotCoordinator.ProcessChatMessage(message.UserId, message.Text);
            Console.WriteLine($"Chatbot: {response.Message}");

            return Ok(response);
        }
    }
}
