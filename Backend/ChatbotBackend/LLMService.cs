using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.Connectors.Google;

public class LLMService
{
    private readonly IChatCompletionService _chatService;

    public LLMService(IConfiguration configuration)
    {
        var apiKey = configuration["GoogleGenerativeAI:ApiKey"];
        var modelId = configuration["GoogleGenerativeAI:ModelId"];

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("Google Generative AI API key is missing or incomplete.");
        }

        var kernel = Kernel.CreateBuilder()
                           .AddGoogleAIGeminiChatCompletion(
                                modelId: modelId,
                                apiKey: apiKey)
                           .Build();

        _chatService = kernel.GetRequiredService<IChatCompletionService>();
    }

    public async Task<string> GetLLMResponseAsync(string userMessage)
    {
        var chatHistory = new ChatHistory();
        chatHistory.AddUserMessage(userMessage);

        var executionSettings = new GeminiPromptExecutionSettings
        {
            MaxTokens = 256,
            // Temperature = 0.7,
            // TopP = 0.9,
            // TopK = 40,
            // ThinkingConfig = new() { ThinkingBudget = 2000 }
        };

        try
        {
            var result = await _chatService.GetChatMessageContentAsync(chatHistory, executionSettings);

            if (result == null)
            {
                return string.Empty;
            }

            return result?.Content;
        }
        catch (Exception ex)
        {
            // Consider re-throwing or handling the exception in a way that is appropriate
            // for your application's error handling strategy.
            throw;
        }
    }
}
