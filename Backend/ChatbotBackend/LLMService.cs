using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Connectors.OpenAI;
using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Connectors.AzureOpenAI;

public class LLMService
{
    private readonly IChatCompletionService _chatService;

    public LLMService(IConfiguration configuration)
    {
        var apiKey = configuration["AzureOpenAI:ApiKey"];
        var deploymentName = configuration["AzureOpenAI:DeploymentName"];
        var endpoint = configuration["AzureOpenAI:Endpoint"];

        if (string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(deploymentName) || string.IsNullOrEmpty(endpoint))
        {
            throw new InvalidOperationException("Azure OpenAI configuration is missing or incomplete.");
        }

        _chatService = new AzureOpenAIChatCompletionService(
            deploymentName,
            endpoint,
            apiKey);
    }

    public async Task<string> GetLLMResponseAsync(string userMessage)
    {
        var chatHistory = new ChatHistory();
        chatHistory.AddUserMessage(userMessage);

        var result = await _chatService.GetChatMessageContentAsync(chatHistory);

        return result?.Content ?? string.Empty;
    }
}
