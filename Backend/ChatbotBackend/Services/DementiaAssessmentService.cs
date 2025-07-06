public class DementiaAssessmentService
{
    private readonly LLMService _llmService;
    private readonly Dictionary<string, DementiaAssessmentState> _assessmentStates = new();

    public DementiaAssessmentService(LLMService llmService)
    {
        _llmService = llmService;
    }

    public string StartAssessment(string userId)
    {
        var state = new DementiaAssessmentState
        {
            UserId = userId,
            CurrentQuestionIndex = 0,
            Responses = new List<QuestionResult>()
        };
        _assessmentStates[userId] = state;

        return "Let's start your dementia pre-assessment. " + DementiaAssessmentQuestions.Questions[0];
    }

    public async Task<string> ContinueAssessmentAsync(string userId, string userResponse)
    {
        if (!_assessmentStates.TryGetValue(userId, out var state) || state.Completed)
        {
            return "It looks like you don't have an active assessment. Would you like to start one?";
        }

        var question = DementiaAssessmentQuestions.Questions[state.CurrentQuestionIndex];
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
            return await GenerateSummaryAsync(state);
        }

        var nextQuestion = DementiaAssessmentQuestions.Questions[state.CurrentQuestionIndex];
        return $"Thank you. Next question: {nextQuestion}";
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

    public bool IsUserInAssessment(string userId)
    {
        return _assessmentStates.TryGetValue(userId, out var state) && !state.Completed;
    }
}
