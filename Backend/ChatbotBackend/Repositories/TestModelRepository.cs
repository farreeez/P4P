using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public class TestModelRepository : ITestModelRepository
    {
        // Simulating a database with an in-memory collection
        private static readonly List<TestModel> _testModels = new();
        private static int _nextId = 1;

        public async Task<TestModel?> GetByIdAsync(int id)
        {
            return await Task.FromResult(_testModels.FirstOrDefault(x => x.Id == id));
        }

        public async Task<IEnumerable<TestModel>> GetAllAsync()
        {
            return await Task.FromResult(_testModels.ToList());
        }

        public async Task<TestModel> CreateAsync(TestModel model)
        {
            model.Id = _nextId++;
            model.CreatedAt = DateTime.UtcNow;
            _testModels.Add(model);
            return await Task.FromResult(model);
        }

        public async Task<TestModel?> UpdateAsync(TestModel model)
        {
            var existing = _testModels.FirstOrDefault(x => x.Id == model.Id);
            if (existing == null) return null;

            existing.Name = model.Name;
            existing.Description = model.Description;

            return await Task.FromResult(existing);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var model = _testModels.FirstOrDefault(x => x.Id == id);
            if (model == null) return false;

            _testModels.Remove(model);
            return await Task.FromResult(true);
        }
    }
}
