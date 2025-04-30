using Backend.Model;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Backend.Data
{
    public class DataRepoImpl : IDataRepo
    {
        private readonly MyDbContext _dbContext;

        public DataRepoImpl(MyDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public TestModel AddTestModel(TestModel testModel)
        {
            EntityEntry<TestModel> e = _dbContext.TestModels.Add(testModel);

            TestModel testModel1 = e.Entity;

            _dbContext.SaveChanges();

            return testModel1;
        }

        public IEnumerable<TestModel> GetTestModelsInAlphabeticalOrder()
        {
            return _dbContext.TestModels.OrderBy(e => e.Name).ToList();
        }

        public TestModel GetTestModelById(int id)
        {
            TestModel testModel = _dbContext.TestModels.FirstOrDefault(e => e.Id == id);
            return testModel;
        }
    }
}
