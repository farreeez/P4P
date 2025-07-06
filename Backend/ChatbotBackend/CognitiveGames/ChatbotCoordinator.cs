

public class ChatbotCoordinator
{
    private readonly LLMService _llmService;
    private readonly CognitiveActivityManager _activityManager;

    public ChatbotCoordinator(LLMService llmService, CognitiveActivityManager activityManager)
    {
        _llmService = llmService;
        _activityManager = activityManager;
    }

    public async Task<string> ProcessChatMessage(string userId, string userMessage)
    {
        // 1. Check if the user is currently engaged in an activity.
        if (_activityManager.IsUserInActivity(userId))
        {
            // If yes, route the message to the activity manager.
            return _activityManager.HandleActivityInput(userId, userMessage);
        }

        // 2. If not in an activity, send the message to the LLM.
        // Prompt engineering for LLM to recognize activity intent:
        // Instruct the LLM to include a specific phrase or token if it detects a game request.
        // For example: "RESPONSE_GAME_START:memory recall"
        // You'll need to modify your LLMService's system prompt or initial chat history for this.
        // Let's assume the LLM is prompted to suggest games.
        string llmRawResponse = await _llmService.GetLLMResponseAsync(userMessage);

        // 3. Analyze the LLM's response for a potential activity start command.
        // This could be based on keywords, or even better, a structured JSON output from the LLM
        // if you configure your LLM to generate functions/tools.
        if (llmRawResponse.ToLower().Contains("start memory recall activity")) // Simple keyword detection
        {
            return _activityManager.StartActivity(userId, "memory recall");
        }
        // Add more conditions for other game types or a more robust intent detection here
        // e.g., if LLM is instructed to respond with "GAME_REQUEST: [game_type]"

        // 4. If no activity intent detected, return the LLM's direct response.
        return llmRawResponse;
    }
}