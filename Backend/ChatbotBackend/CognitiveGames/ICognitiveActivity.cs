
public interface ICognitiveActivity
{
    string ActivityName { get; }
    string GetInitialPrompt();
    string GetNextPrompt(string userAnswer);
    bool IsActivityComplete { get; }
    string GetCompletionMessage();
    bool EvaluateAnswer(string userAnswer); // Method to evaluate user's answer
}
