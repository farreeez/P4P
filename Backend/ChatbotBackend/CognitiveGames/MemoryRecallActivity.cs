using System.Collections.Generic;
using System.Linq;

namespace BrainHealthChatbot.CognitiveActivities
{
    public class MemoryRecallActivity : ICognitiveActivity
    {
        public string ActivityName => "Memory Recall";
        private List<string> _itemsToMemorize;
        private int _currentStage = 0; // 0: initial prompt, 1: awaiting recall
        private string _lastUserAttempt; // Store user's last attempt for evaluation
        private bool _isComplete = false;

        public MemoryRecallActivity()
        {
            // In a real application, you'd load these from a data source or choose based on difficulty
            _itemsToMemorize = new List<string> { "apple", "book", "cloud" };
        }

        public string GetInitialPrompt()
        {
            _currentStage = 0; // Reset or ensure at initial stage
            return $"I'm going to give you a list of words. Try to remember them: **{string.Join(", ", _itemsToMemorize)}**. Once you're ready, type 'ready' to proceed, or just try to recall them.";
        }

        public string GetNextPrompt(string userAnswer)
        {
            // If the user says "ready" or attempts to recall immediately
            if (_currentStage == 0 && (userAnswer.ToLower().Contains("ready") || userAnswer.ToLower().Contains(_itemsToMemorize[0].ToLower())))
            {
                _currentStage = 1; // Move to recall stage
                return "Okay, what were the words you just saw?";
            }
            else if (_currentStage == 1) // User is attempting to recall
            {
                _lastUserAttempt = userAnswer; // Store the user's attempt
                _isComplete = true; // Assume one attempt for this simple example
                return GetCompletionMessage();
            }
            // Fallback for unexpected input
            return "Please type 'ready' when you've memorized the words, or try recalling them now.";
        }

        public bool IsActivityComplete => _isComplete;

        public bool EvaluateAnswer(string userAnswer)
        {
            // Simple evaluation: check if all memorized items are present in the user's answer
            // This could be made more robust (e.g., exact matches, order)
            return _itemsToMemorize.All(item => userAnswer.ToLower().Contains(item.ToLower()));
        }

        public string GetCompletionMessage()
        {
            bool correct = EvaluateAnswer(_lastUserAttempt);
            string resultMessage = correct ? "That's correct! You remembered all the words." : "Not quite! The words were: " + string.Join(", ", _itemsToMemorize) + ". Keep practicing!";
            return resultMessage + "\nWould you like to try another game?";
        }
    }
}