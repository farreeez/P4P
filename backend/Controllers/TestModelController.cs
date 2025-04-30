using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Backend.Model;
using Backend.Dtos;

namespace Backend.Controllers
{
    [Route("testapi")]
    [ApiController]
    public class TestModelController : Controller
    {
        private readonly IDataRepo _repository;

        public TestModelController(IDataRepo dataRepo) {
            _repository = dataRepo;
        }

        [HttpGet("GetTestModels")]
        public ActionResult<IEnumerable<TestModel>> GetTestModels() {
            IEnumerable<TestModel> models = _repository.GetTestModelsInAlphabeticalOrder();
            return Ok(models);
        }

        [HttpGet("GetTestModel/{id}")]
        public ActionResult GetTestModel(int id)
        {
            TestModel model = _repository.GetTestModelById(id);
            if (model == null)
            {
                return NotFound();
            }
            return Ok(model);
        }

        [HttpPost("AddTestModel")]
        public ActionResult<TestModel> AddTestModel(TestModelInputDto testModel)
        {
            TestModel testModel1 = new TestModel { Name = testModel.Name };
            TestModel addedTestModel = _repository.AddTestModel(testModel1);
            TestModelOutDto testModelOutDto = new TestModelOutDto { Id = addedTestModel.Id, Name = addedTestModel.Name };
            return CreatedAtAction(nameof(AddTestModel), testModelOutDto);
        }
    }
}
