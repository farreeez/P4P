public static class DementiaAssessmentQuestions
{
    public static readonly List<(string Question, AssessmentQuestionType Type)> Questions = new()
    {
        ("What day of the week is it today?", AssessmentQuestionType.SimpleAssessment),
        ("Please repeat these three words: apple, table, penny.", AssessmentQuestionType.MemoryRecall),
        ("Can you count backward from 20 to 1?", AssessmentQuestionType.VerbalOnly),
        ("Name as many animals as you can in 30 seconds.", AssessmentQuestionType.TimedVerbal)
    };

    public static AssessmentBehavior GetBehaviorForType(AssessmentQuestionType type)
    {
        return type switch
        {
            AssessmentQuestionType.SimpleAssessment => new AssessmentBehavior
            {
                RequiresVoice = false,
                HideAfterDelay = false,
                RequiresReadAloud = true
            },
            AssessmentQuestionType.MemoryRecall => new AssessmentBehavior
            {
                RequiresVoice = false,
                HideAfterDelay = true,
                HideDelaySeconds = 3,
                RequiresReadAloud = true
            },
            AssessmentQuestionType.VerbalOnly => new AssessmentBehavior
            {
                RequiresVoice = true,
                HideAfterDelay = false,
                RequiresReadAloud = true
            },
            AssessmentQuestionType.TimedVerbal => new AssessmentBehavior
            {
                RequiresVoice = true,
                HideAfterDelay = false,
                HasTimer = true,
                TimerDurationSeconds = 30,
                RequiresReadAloud = true
            },
            _ => new AssessmentBehavior()
        };
    }
}
