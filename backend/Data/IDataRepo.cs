using Backend.Model;

namespace Backend.Data
{
    public interface IDataRepo
    {
        public IEnumerable<TestModel> GetTestModelsInAlphabeticalOrder();

        public TestModel AddTestModel(TestModel testModel);

        public TestModel GetTestModelById(int id);
    }
}
