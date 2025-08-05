using ChatbotBackend.LLMServices;
using ChatbotBackend.Services; // Add this using directive




// Make sure ChatbotCoordinator is in the correct namespace (e.g., ChatbotBackend.Services)
public class ChatbotCoordinator
{
    private readonly LLMService _llmService;
    private readonly DementiaAssessmentService _assessmentService;
    private readonly CognitiveActivityManager _activityManager;
    private readonly FactExtractionService _factExtractionService; // Inject new service

    public ChatbotCoordinator(
        LLMService llmService,
        DementiaAssessmentService assessmentService,
        CognitiveActivityManager activityManager,
        FactExtractionService factExtractionService) // Add to constructor
    {
        _llmService = llmService;
        _assessmentService = assessmentService;
        _activityManager = activityManager;
        _factExtractionService = factExtractionService; // Assign
    }

    public async Task<string> ProcessChatMessage(string? userId, string userMessage)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return "Please provide a user ID to start the conversation.";
        }

        // 1. First, attempt to extract and store facts from the current message [New]
        await _factExtractionService.ExtractAndStoreFactsAsync(userId, userMessage);

        // Check if user is in an assessment
        if (await _assessmentService.IsUserInAssessment(userId))
        {
            return await _assessmentService.ContinueAssessmentAsync(userId, userMessage);
        }

        // Check if user is in an activity
        if (_activityManager.IsUserInActivity(userId))
        {
            return _activityManager.HandleActivityInput(userId, userMessage);
        }

        // Detect user request to start assessment
        if (userMessage.ToLower().Contains("start dementia assessment") || userMessage.ToLower().Contains("memory check"))
        {
            return await _assessmentService.StartAssessment(userId);
        }

        // Otherwise, route to LLM
        string llmRawResponse = await _llmService.GetLLMResponseAsync(userMessage, userId);

        // Check for starting cognitive activities
        if (llmRawResponse.ToLower().Contains("start memory recall activity"))
        {
            return _activityManager.StartActivity(userId, "memory recall");
        }

        return llmRawResponse;
    }
}