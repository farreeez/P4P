using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AppController
        : ControllerBase
    {

        private readonly ILogger<AppController> _logger;

        public AppController(ILogger<AppController> logger)
        {
            _logger = logger;
        }

        [HttpGet("Test")]
        public ActionResult testEndpoint()
        {
            return Ok("It worked!");
        }
        
    }
}
