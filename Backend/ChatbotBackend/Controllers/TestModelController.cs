using ChatbotBackend.DTOs;
using ChatbotBackend.Model;
using ChatbotBackend.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace ChatbotBackend.Controllers
{
    [ApiController]
    [Route("api/test")]
    public class TestModelController : ControllerBase
    {
        private readonly ITestModelRepository _repository;
        private readonly ILogger<TestModelController> _logger;

        public TestModelController(ITestModelRepository repository, ILogger<TestModelController> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TestModelOutputDto>> GetById(int id)
        {
            var model = await _repository.GetByIdAsync(id);
            if (model == null) return NotFound();

            return Ok(ToDto(model));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TestModelOutputDto>>> GetAll()
        {
            var models = await _repository.GetAllAsync();
            return Ok(models.Select(ToDto));
        }

        [HttpPost]
        public async Task<ActionResult<TestModelOutputDto>> Create(TestModelInputDto input)
        {
            var model = new TestModel
            {
                Name = input.Name,
                Description = input.Description
            };

            var created = await _repository.CreateAsync(model);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, ToDto(created));
        }

        private static TestModelOutputDto ToDto(TestModel model) =>
            new(model.Id, model.Name, model.Description, model.CreatedAt);
    }
}
