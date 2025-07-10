public class QuestionResult
{
    public string Question { get; set; }
    public string UserAnswer { get; set; }
    public bool Correct { get; set; }
    public TimeSpan ResponseTime { get; set; }
}