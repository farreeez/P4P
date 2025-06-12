using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.Connectors.Google;
using Microsoft.Extensions.Logging;

public class LLMService
{
    private readonly IChatCompletionService _chatService;
    private readonly ILogger<LLMService> _logger;

    public LLMService(IConfiguration configuration, ILogger<LLMService> logger)
    {
        _logger = logger;

        var apiKey = configuration["GoogleGenerativeAI:ApiKey"];
        var modelId = configuration["GoogleGenerativeAI:ModelId"];

        _logger.LogInformation("LLMService: Initializing with ModelId: {ModelId}", modelId ?? "null");
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogError("LLMService: Google Generative AI API key is missing or incomplete.");
            throw new InvalidOperationException("Google Generative AI API key is missing or incomplete.");
        }
        _logger.LogInformation("LLMService: API Key retrieved successfully (masked for security).");

#pragma warning disable SKEXP0070
        var kernel = Kernel.CreateBuilder()
                           .AddGoogleAIGeminiChatCompletion(
                                modelId: modelId,
                                apiKey: apiKey)
                           .Build();
#pragma warning restore SKEXP0070

        _chatService = kernel.GetRequiredService<IChatCompletionService>();
        _logger.LogInformation("LLMService: Gemini chat service initialized.");
    }

    public async Task<string> GetLLMResponseAsync(string userMessage)
    {
        _logger.LogInformation("LLMService: Received user message: {UserMessage}", userMessage);
        var chatHistory = new ChatHistory();
        // chatHistory.AddSystemMessage("You are a helpful AI assistant.");
        chatHistory.AddUserMessage(userMessage);

        // Corrected: Use GeminiPromptExecutionSettings as per your provided example
#pragma warning disable SKEXP0070 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.
        var executionSettings = new GeminiPromptExecutionSettings
        {
            MaxTokens = 256,
            // Temperature = 0.7,
            // TopP = 0.9,
            // TopK = 40,
            // ThinkingConfig = new() { ThinkingBudget = 2000 }
        };
#pragma warning restore SKEXP0070 // Type is for evaluation purposes only and is subject to change or removal in future updates. Suppress this diagnostic to proceed.

        try
        {
            var result = await _chatService.GetChatMessageContentAsync(chatHistory, executionSettings);

            if (result == null)
            {
                _logger.LogWarning("LLMService: GetChatMessageContentAsync returned null result.");
                return string.Empty;
            }

            _logger.LogInformation("LLMService: Chat response content: {Content}", result.Content);
            _logger.LogDebug("LLMService: Full chat response object: {@Result}", result);

            return result?.Content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LLMService: Error getting LLM response for message: {UserMessage}", userMessage);
            throw;
        }
    }
}