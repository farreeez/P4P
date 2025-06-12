using ChatbotBackend.Model;

namespace ChatbotBackend.Repositories
{
    public class CalendarRepository : ICalendarRepository
    {
        // Simulating a database with an in-memory collection
        private static readonly List<Calendar> _calendarEvents = new();

        public async Task<Calendar?> GetByIdAsync(string id)
        {
            return await Task.FromResult(_calendarEvents.FirstOrDefault(x => x.Id == id));
        }

        public async Task<IEnumerable<Calendar>> GetAllAsync()
        {
            return await Task.FromResult(_calendarEvents.ToList());
        }

        public async Task<Calendar> CreateAsync(Calendar calendar)
        {
            calendar.Id = Guid.NewGuid().ToString();
            _calendarEvents.Add(calendar);
            return await Task.FromResult(calendar);
        }

        public async Task<Calendar?> UpdateAsync(Calendar calendar)
        {
            var existing = _calendarEvents.FirstOrDefault(x => x.Id == calendar.Id);
            if (existing == null) return null;

            existing.EventName = calendar.EventName;
            existing.EventDescription = calendar.EventDescription;
            existing.EventDate = calendar.EventDate;
            existing.StartTime = calendar.StartTime;
            existing.EndTime = calendar.EndTime;
            existing.Category = calendar.Category;
            // Note: UserId should not be updated after creation

            return await Task.FromResult(existing);
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var calendar = _calendarEvents.FirstOrDefault(x => x.Id == id);
            if (calendar == null) return false;

            _calendarEvents.Remove(calendar);
            return await Task.FromResult(true);
        }

        public async Task<IEnumerable<Calendar>> GetByUserIdAsync(string userId)
        {
            return await Task.FromResult(_calendarEvents.Where(x => x.UserId == userId).ToList());
        }

        public async Task<IEnumerable<Calendar>> GetUnfinishedEventsByUserIdAsync(string userId)
        {
            var currentTime = DateTime.UtcNow;
            return await Task.FromResult(_calendarEvents
                .Where(x => x.UserId == userId && x.EndTime > currentTime)
                .ToList());
        }
    }
}