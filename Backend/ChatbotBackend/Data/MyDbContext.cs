// Example (ensure MyDbContext.cs looks similar, especially the DbSet<User>)
using Microsoft.EntityFrameworkCore;
using ChatbotBackend.Model;



public class MyDbContext : DbContext
{
    public MyDbContext(DbContextOptions<MyDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Calendar> Calendar { get; set; } // Assuming you have a Calendar model

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure the primary key for the User entity if it's not default (string Id works well as PK)
        modelBuilder.Entity<User>().HasKey(u => u.Id);
        // If UserId in Calendar is a foreign key, ensure it's configured:
        modelBuilder.Entity<Calendar>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(c => c.UserId);
    }
}