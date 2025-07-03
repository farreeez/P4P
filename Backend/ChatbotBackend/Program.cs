using ChatbotBackend;
using ChatbotBackend.Data;
using ChatbotBackend.Repositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add configuration for user secrets
builder.Configuration.AddUserSecrets<Program>();

// Add controllers
builder.Services.AddControllers();

// Register repositories FIRST (since LLMService depends on them)
builder.Services.AddSingleton<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICalendarRepository, CalendarRepository>();

// Register LLMService AFTER repositories (so dependency injection can resolve them)
builder.Services.AddSingleton<LLMService>();

// Register other services
builder.Services.AddSingleton<TextToSpeechService>();
builder.Services.AddSingleton<SpeechToTextService>();

// Add DbContext configuration
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register TestModelRepository (this one uses DbContext, so it should be Scoped)
builder.Services.AddScoped<ITestModelRepository, TestModelRepository>();

// Add API documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
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

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS
app.UseCors("AllowLocalhost");

// Use authorization
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Run the application
app.Run();