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

    public async Task<ChatResponse> ProcessChatMessage(string? userId, string userMessage)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return new ChatResponse
            {
                Message = "Please provide a user ID to start the conversation.",
                QuestionType = AssessmentQuestionType.Standard
            };
        }

        await _factExtractionService.ExtractAndStoreFactsAsync(userId, userMessage);

        if (await _assessmentService.IsUserInAssessment(userId))
        {
            var (response, questionType) = await _assessmentService.ContinueAssessmentAsync(userId, userMessage);
            return new ChatResponse
            {
                Message = response,
                QuestionType = questionType,
                Behavior = DementiaAssessmentQuestions.GetBehaviorForType(questionType)
            };
        }

        // Check if user is in an activity
        if (_activityManager.IsUserInActivity(userId))
        {
            return new ChatResponse
            {
                Message = _activityManager.HandleActivityInput(userId, userMessage),
                QuestionType = AssessmentQuestionType.Standard
            };
        }

        // Detect user request to start assessment
        if (userMessage.ToLower().Contains("start dementia assessment") ||
            userMessage.ToLower().Contains("memory check"))
        {
            return await _assessmentService.StartAssessment(userId);
        }

        // Otherwise, route to LLM
        string llmResponse = await _llmService.GetLLMResponseAsync(userMessage, userId);
        return new ChatResponse
        {
            Message = llmResponse,
            QuestionType = AssessmentQuestionType.Standard
        };
    }
}