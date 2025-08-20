using ChatbotBackend.LLMServices;
using ChatbotBackend.Repositories;
using ChatbotBackend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.Extensions.AI;
using Microsoft.SemanticKernel.Embeddings;

var builder = WebApplication.CreateBuilder(args);

// Add configuration for user secrets
builder.Configuration.AddUserSecrets<Program>();

// Add controllers
builder.Services.AddControllers();

// Add DbContext configuration
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register ChatHistoryManager as a SINGLETON.
// This is the CRITICAL change to make sure the chat history is not lost.
builder.Services.AddSingleton<ChatHistoryManager>();

// Register repositories and core services as Scoped.
// This is the correct lifetime for services that depend on DbContext or are created per request.
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICalendarRepository, CalendarRepository>();

// Register the Embedding Generation service.
builder.Services.AddScoped<ITextEmbeddingGenerationService>(sp =>
{
    var config = sp.GetRequiredService<IConfiguration>();
    var apiKey = config["GoogleGenerativeAI:ApiKey"];
    var modelId = config["GoogleGenerativeAI:ModelId"];
    var embeddingModelId = config["GoogleGenerativeAI:EmbeddingModelId"] ?? modelId;

    var kernel = Kernel.CreateBuilder()
        .AddGoogleAIEmbeddingGeneration(embeddingModelId, apiKey)
        .Build();

    return kernel.GetRequiredService<ITextEmbeddingGenerationService>();
});

// Services depending on repositories should be scoped.
// We are reverting the LLMService registration back to scoped to resolve the lifetime conflict.
builder.Services.AddScoped<LLMService>();
builder.Services.AddScoped<DementiaAssessmentService>();
builder.Services.AddScoped<ChatbotCoordinator>();
builder.Services.AddScoped<FactExtractionService>();

// Other services.
builder.Services.AddSingleton<TextToSpeechService>();
builder.Services.AddSingleton<SpeechToTextService>();
builder.Services.AddSingleton<CognitiveActivityManager>();

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

// Use HTTPS redirection
app.UseHttpsRedirection();

// Use authorization
app.UseAuthorization();

// Map controllers
app.MapControllers();

// Run the application
app.Run();
