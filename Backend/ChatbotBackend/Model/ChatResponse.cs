public class ChatResponse
{
    public string Message { get; set; }
    public AssessmentQuestionType QuestionType { get; set; }
    public AssessmentBehavior? Behavior { get; set; }
}

public class AssessmentBehavior
{
    public bool RequiresVoice { get; set; }
    public bool HideAfterDelay { get; set; }
    public int? HideDelaySeconds { get; set; }
    public bool HasTimer { get; set; }
    public int? TimerDurationSeconds { get; set; }
    public bool RequiresReadAloud { get; set; }
}
