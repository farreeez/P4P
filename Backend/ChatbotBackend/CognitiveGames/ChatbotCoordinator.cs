public class ChatbotCoordinator
{
    private readonly LLMService _llmService;
    private readonly CognitiveActivityManager _activityManager;
    private readonly DementiaAssessmentService _assessmentService;

    public ChatbotCoordinator(LLMService llmService, CognitiveActivityManager activityManager, DementiaAssessmentService assessmentService)
    {
        _llmService = llmService;
        _activityManager = activityManager;
        _assessmentService = assessmentService;
    }

    public async Task<string> ProcessChatMessage(string userId, string userMessage)
    {
        // Check if user is in an assessment
        if (_assessmentService.IsUserInAssessment(userId))
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
            return _assessmentService.StartAssessment(userId);
        }

        // Otherwise, route to LLM
        string llmRawResponse = await _llmService.GetLLMResponseAsync(userMessage);

        // Check for starting cognitive activities
        if (llmRawResponse.ToLower().Contains("start memory recall activity"))
        {
            return _activityManager.StartActivity(userId, "memory recall");
        }

        return llmRawResponse;
    }
}
