using ChatbotBackend.Model;
using ChatbotBackend.Repositories;
using Microsoft.EntityFrameworkCore;

public class UserRepository : IUserRepository
{
    private readonly MyDbContext _context;

    public UserRepository(MyDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        return await _context.Users.FindAsync(id);
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    public async Task<User> CreateAsync(User user)
    {
        user.Id = Guid.NewGuid().ToString();
        user.CalendarItems ??= new List<string>();

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task<User?> UpdateAsync(User user)
    {
        var existing = await _context.Users.FindAsync(user.Id);
        if (existing == null) return null;

        existing.FullName = user.FullName;
        existing.Email = user.Email;
        existing.Password = user.Password;
        existing.CalendarItems = user.CalendarItems ?? existing.CalendarItems;

        await _context.SaveChangesAsync();
        return existing;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.Email.ToLower() == email.ToLower());
    }

    public async Task<User?> GetByFullNameAsync(string fullName)
    {
        return await _context.Users
            .FirstOrDefaultAsync(x => x.FullName.ToLower() == fullName.ToLower());
    }

    public async Task<User?> AuthenticateAsync(string email, string password)
    {
        return await _context.Users.FirstOrDefaultAsync(x =>
            x.Email.ToLower() == email.ToLower() && x.Password == password);
    }
}
