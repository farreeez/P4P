// Services/CognitiveActivityManager.cs
using System.Collections.Concurrent;
using BrainHealthChatbot.CognitiveActivities;



    public class CognitiveActivityManager
    {
        // Use ConcurrentDictionary for thread-safety if multiple users are interacting
        private ConcurrentDictionary<string, ICognitiveActivity> _userActiveActivities = new();
        private ConcurrentDictionary<string, int> _userScores = new(); // Optional: track scores

        public bool IsUserInActivity(string userId)
        {
            return _userActiveActivities.ContainsKey(userId);
        }

        public string StartActivity(string userId, string activityType)
        {
            // Ensure only one activity per user at a time
            if (_userActiveActivities.ContainsKey(userId))
            {
                return "You are already in an activity. Please complete it first or say 'quit game'.";
            }

            ICognitiveActivity activity;
            switch (activityType.ToLower())
            {
                case "memory recall":
                    activity = new MemoryRecallActivity();
                    break;
                // Add cases for other activities here
                // For example:
                // case "word association":
                //     activity = new WordAssociationActivity();
                //     break;
                default:
                    return $"I don't currently have a '{activityType}' activity. Would you like to try 'Memory Recall'?";
            }

            _userActiveActivities[userId] = activity;
            return activity.GetInitialPrompt();
        }

        public string HandleActivityInput(string userId, string userInput)
        {
            if (!_userActiveActivities.TryGetValue(userId, out var activity))
            {
                return "You are not currently in an activity. Would you like to start a brain game?";
            }

            // Allow users to quit an activity
            if (userInput.ToLower() == "quit game" || userInput.ToLower() == "exit game")
            {
                _userActiveActivities.TryRemove(userId, out _); // Remove activity for user
                return "Okay, I've ended the current game. What else can I help you with?";
            }

            string response = activity.GetNextPrompt(userInput);

            if (activity.IsActivityComplete)
            {
                // Optionally update score
                if (activity.EvaluateAnswer(userInput)) // Pass user's final input for evaluation
                {
                    _userScores.AddOrUpdate(userId, 1, (key, oldValue) => oldValue + 1);
                }

                _userActiveActivities.TryRemove(userId, out _); // Remove activity after completion
                // The activity's GetCompletionMessage is already included in 'response'
            }
            return response;
        }
    }
