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

        [HttpPost("chat")]
        public async Task<IActionResult> PostChat(String text)
        {

            Console.WriteLine($"User: {text}");
            if (string.IsNullOrWhiteSpace(text))
            {
                return BadRequest("Message is required.");
            }

            var response = await _llmService.GetLLMResponseAsync(text);
            Console.WriteLine($"Chatbot: {response}");
            return Ok(new { response });
        }

    }
}
