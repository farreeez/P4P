using ChatbotBackend.Repositories;

public class DementiaAssessmentService
{
    private readonly LLMService _llmService;
    private readonly IUserRepository _userRepository;  // Change to interface

    public DementiaAssessmentService(LLMService llmService, IUserRepository userRepository)  // Change to interface
    {
        _llmService = llmService;
        _userRepository = userRepository;
    }

    public async Task<ChatResponse> StartAssessment(string userId)
    {
        var state = new DementiaAssessmentState
        {
            CurrentQuestionIndex = 0,
            Responses = new List<QuestionResult>()
        };
        
        await _userRepository.UpdateAssessmentStateAsync(userId, state);
        var (question, type) = DementiaAssessmentQuestions.Questions[0];
        return new ChatResponse
        {
            Message = $"Let's start your dementia pre-assessment. {question}",
            QuestionType = type,
            Behavior = DementiaAssessmentQuestions.GetBehaviorForType(type)
        };
    }

    public async Task<(string Message, AssessmentQuestionType Type)> ContinueAssessmentAsync(string userId, string userResponse)
    {
        var state = await _userRepository.GetAssessmentStateAsync(userId);
        if (state == null || state.Completed)
        {
            return ("It looks like you don't have an active assessment. Would you like to start one?", 
                AssessmentQuestionType.Standard);
        }

        var (question, questionType) = DementiaAssessmentQuestions.Questions[state.CurrentQuestionIndex];
        var responseStartTime = DateTime.UtcNow;

        var interpretation = await _llmService.GetLLMResponseWithContextAsync(
            userResponse,
            $"Evaluate if this response is correct for the question: '{question}'. Just reply with 'correct' or 'incorrect' and a short explanation."
        );

        var correct = interpretation.Contains("correct", StringComparison.OrdinalIgnoreCase) &&
                     !interpretation.Contains("incorrect", StringComparison.OrdinalIgnoreCase);

        state.Responses.Add(new QuestionResult
        {
            Question = question,
            UserAnswer = userResponse,
            Correct = correct,
            ResponseTime = DateTime.UtcNow - responseStartTime
        });

        state.CurrentQuestionIndex++;

        if (state.CurrentQuestionIndex >= DementiaAssessmentQuestions.Questions.Count)
        {
            state.Completed = true;
            await _userRepository.UpdateAssessmentStateAsync(userId, state);
            return (await GenerateSummaryAsync(state), AssessmentQuestionType.Standard);
        }

        await _userRepository.UpdateAssessmentStateAsync(userId, state);
        var (nextQuestion, nextType) = DementiaAssessmentQuestions.Questions[state.CurrentQuestionIndex];
        return ($"Thank you. Next question: {nextQuestion}", nextType);
    }

    private async Task<string> GenerateSummaryAsync(DementiaAssessmentState state)
    {
        var correctCount = state.Responses.Count(r => r.Correct);
        var incorrectCount = state.Responses.Count(r => !r.Correct);

        var summaryText = $"The user answered {correctCount} questions correctly and {incorrectCount} incorrectly.";

        var detailedSummary = await _llmService.GetLLMResponseWithContextAsync(
            summaryText,
            "Please provide a supportive, empathetic summary for the user based on these results. Suggest next steps if any potential cognitive issues are detected."
        );

        return "Assessment complete!\n\n" + detailedSummary;
    }

    public async Task<bool> IsUserInAssessment(string userId)
    {
        var state = await _userRepository.GetAssessmentStateAsync(userId);
        return state != null && !state.Completed;
    }
}
