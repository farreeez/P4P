using ChatbotBackend;
using ChatbotBackend.Data;
using ChatbotBackend.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddUserSecrets<Program>();
builder.Services.AddControllers();
builder.Services.AddSingleton<LLMService>();
builder.Services.AddSingleton<IUserRepository, UserRepository>(); // Register repository with interface
builder.Services.AddSingleton<ICalendarRepository, CalendarRepository>(); // Add calendar repository
builder.Services.AddSingleton<TextToSpeechService>(); // Add TTS service
builder.Services.AddSingleton<IUserRepository, UserRepository>(); // Register repository with interface
builder.Services.AddSingleton<ICalendarRepository, CalendarRepository>(); // Add calendar repository

// Add DbContext configuration
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ITestModelRepository, TestModelRepository>(); // Add this line
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowLocalhost");

app.UseAuthorization();

app.MapControllers();

app.Run();
