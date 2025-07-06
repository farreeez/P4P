namespace ChatbotBackend;

// Example: Create a new class to manage game state and logic
public class CognitiveActivityManager
{
    private Dictionary<string, ICognitiveActivity> _activeActivities = new();
    private Dictionary<string, int> _userScores = new(); // To track scores per user/session

    // Define an interface for different activity types
    public interface ICognitiveActivity
    {
        string ActivityName { get; }
        string GetInitialPrompt();
        string GetNextPrompt(string userAnswer);
        bool IsActivityComplete { get; }
        bool EvaluateAnswer(string userAnswer);
        string GetCompletionMessage();
    }

    // Example Memory Recall Activity
    public class MemoryRecallActivity : ICognitiveActivity
    {
        public string ActivityName => "Memory Recall";
        private List<string> _itemsToMemorize;
        private int _currentStage = 0;
        private string _lastQuestion;
        private List<string> _correctAnswers;

        public MemoryRecallActivity()
        {
            // Simple example, ideally loaded from data store
            _itemsToMemorize = new List<string> { "cat", "house", "tree" };
            _correctAnswers = new List<string>();
        }

        public string GetInitialPrompt()
        {
            _lastQuestion = $"Remember these words: {string.Join(", ", _itemsToMemorize)}. What were the words?";
            return _lastQuestion;
        }

        public string GetNextPrompt(string userAnswer)
        {
            if (_currentStage == 0) // First prompt is to remember
            {
                // In a real scenario, the user's "answer" to the initial prompt would be them acknowledging they've seen the words.
                // Then the next prompt would be the actual recall question.
                _currentStage++;
                _lastQuestion = "Now, please tell me the words you just saw.";
                return _lastQuestion;
            }
            else // User is recalling
            {
                // This is where you'd evaluate the user's recall
                // For simplicity, we'll assume the activity completes after one recall attempt
                IsActivityComplete = true;
                return GetCompletionMessage();
            }
        }

        public bool IsActivityComplete { get; private set; } = false;

        public bool EvaluateAnswer(string userAnswer)
        {
            // Basic evaluation: check if all memorized items are present in the user's answer
            bool allPresent = _itemsToMemorize.All(item => userAnswer.ToLower().Contains(item.ToLower()));
            if (allPresent)
            {
                _correctAnswers.AddRange(_itemsToMemorize); // Store for completion message
            }
            return allPresent;
        }

        public string GetCompletionMessage()
        {
            return $"Activity complete! The words were: {string.Join(", ", _itemsToMemorize)}. {(EvaluateAnswer(_lastQuestion) ? "Great job!" : "Keep practicing!")}";
        }
    }


    // Method to start an activity
    public string StartActivity(string userId, string activityType)
    {
        // For simplicity, hardcode activity creation. In a real app, use a factory pattern or DI.
        ICognitiveActivity activity;
        switch (activityType.ToLower())
        {
            case "memory recall":
                activity = new MemoryRecallActivity();
                break;
            // Add other activity types here
            default:
                return "I don't have that activity. Would you like to try 'Memory Recall'?";
        }
        _activeActivities[userId] = activity;
        return activity.GetInitialPrompt();
    }

    // Method to handle user input during an activity
    public string HandleActivityInput(string userId, string userInput)
    {
        if (!_activeActivities.TryGetValue(userId, out var activity))
        {
            return "You are not currently in an activity. Would you like to start one?";
        }

        if (activity.IsActivityComplete)
        {
            _activeActivities.Remove(userId);
            return activity.GetCompletionMessage();
        }

        string response = activity.GetNextPrompt(userInput);
        if (activity.IsActivityComplete)
        {
            bool correct = activity.EvaluateAnswer(userInput);
            if (correct)
            {
                _userScores[userId] = _userScores.GetValueOrDefault(userId, 0) + 1; // Increment score
            }
            response += $"\nYour current score is: {_userScores[userId]}. {activity.GetCompletionMessage()}";
            _activeActivities.Remove(userId); // End activity
        }
        return response;
    }
}
