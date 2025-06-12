using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string id);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> CreateAsync(User user);
        Task<User?> UpdateAsync(User user);
        Task<bool> DeleteAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByFullNameAsync(string fullName);
        Task<User?> AuthenticateAsync(string email, string password);
    }
}