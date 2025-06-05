using ChatbotBackend.Model;
using Microsoft.EntityFrameworkCore;

namespace ChatbotBackend.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {
        }

        public DbSet<TestModel> TestModels { get; set; }
    }
}
