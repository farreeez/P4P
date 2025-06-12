using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public interface ICalendarRepository
    {
        Task<Calendar?> GetByIdAsync(string id);
        Task<IEnumerable<Calendar>> GetAllAsync();
        Task<Calendar> CreateAsync(Calendar calendar);
        Task<Calendar?> UpdateAsync(Calendar calendar);
        Task<bool> DeleteAsync(string id);
        Task<IEnumerable<Calendar>> GetByUserIdAsync(string userId);
        Task<IEnumerable<Calendar>> GetUnfinishedEventsByUserIdAsync(string userId);
    }
}