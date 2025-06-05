using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public interface ITestModelRepository
    {
        Task<TestModel?> GetByIdAsync(int id);
        Task<IEnumerable<TestModel>> GetAllAsync();
        Task<TestModel> CreateAsync(TestModel model);
        Task<TestModel?> UpdateAsync(TestModel model);
        Task<bool> DeleteAsync(int id);
    }
}
