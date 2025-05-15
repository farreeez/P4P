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

        public AppController(ILogger<AppController> logger, LLMService llmService)
        {
            _logger = logger;
            _llmService = llmService;
        }

        [HttpGet("Test")]
        public ActionResult testEndpoint()
        {
            return Ok("It worked!");
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

            var response = await _llmService.GetLLMResponseAsync(message.Text);
            Console.WriteLine($"Chatbot: {response}");
            return Ok(new { response });
        }

    }
}
