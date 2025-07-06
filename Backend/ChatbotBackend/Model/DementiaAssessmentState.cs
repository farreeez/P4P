public class DementiaAssessmentState
{
    public string UserId { get; set; }
    public int CurrentQuestionIndex { get; set; } = 0;
    public List<QuestionResult> Responses { get; set; } = new();
    public bool Completed { get; set; } = false;
}