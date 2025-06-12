using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public class UserRepository : IUserRepository
    {
        // Simulating a database with an in-memory collection
        private static readonly List<User> _users = new();

        public async Task<User?> GetByIdAsync(string id)
        {
            return await Task.FromResult(_users.FirstOrDefault(x => x.Id == id));
        }

        public async Task<IEnumerable<User>> GetAllAsync()
        {
            return await Task.FromResult(_users.ToList());
        }

        public async Task<User> CreateAsync(User user)
        {
            user.Id = Guid.NewGuid().ToString();
            user.CalendarItems = user.CalendarItems ?? new List<string>();
            _users.Add(user);
            return await Task.FromResult(user);
        }

        public async Task<User?> UpdateAsync(User user)
        {
            var existing = _users.FirstOrDefault(x => x.Id == user.Id);
            if (existing == null) return null;

            existing.FullName = user.FullName;
            existing.Email = user.Email;
            existing.Password = user.Password;
            existing.CalendarItems = user.CalendarItems ?? existing.CalendarItems;

            return await Task.FromResult(existing);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var user = _users.FirstOrDefault(x => x.Id == id);
            if (user == null) return false;

            _users.Remove(user);
            return await Task.FromResult(true);
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await Task.FromResult(_users.FirstOrDefault(x => 
                x.Email.Equals(email, StringComparison.OrdinalIgnoreCase)));
        }

        public async Task<User?> GetByFullNameAsync(string fullName)
        {
            return await Task.FromResult(_users.FirstOrDefault(x => 
                x.FullName.Equals(fullName, StringComparison.OrdinalIgnoreCase)));
        }

        public async Task<User?> AuthenticateAsync(string email, string password)
        {
            return await Task.FromResult(_users.FirstOrDefault(x => 
                x.Email.Equals(email, StringComparison.OrdinalIgnoreCase) && 
                x.Password == password));
        }
    }
}