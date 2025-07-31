using ChatbotBackend.LLMServices;
using ChatbotBackend.Repositories;
using ChatbotBackend.Services; // Add this using directive
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add configuration for user secrets
builder.Configuration.AddUserSecrets<Program>();

// Add controllers
builder.Services.AddControllers();

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();

// Services depending on repositories
builder.Services.AddScoped<LLMService>();
builder.Services.AddScoped<DementiaAssessmentService>();
builder.Services.AddScoped<ChatbotCoordinator>();

// Register the new FactExtractionService [New]
builder.Services.AddScoped<FactExtractionService>();

// Other services (keep as singleton **only if** they don't depend on scoped services)
builder.Services.AddSingleton<TextToSpeechService>();
builder.Services.AddSingleton<SpeechToTextService>();
builder.Services.AddSingleton<CognitiveActivityManager>();

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