using Backend.Model;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data
{
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }
        public DbSet<TestModel> TestModels { get; set; }
    }
}
