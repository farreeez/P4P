using System.Collections.Concurrent;
using Microsoft.SemanticKernel.ChatCompletion;

namespace ChatbotBackend.Services
{
    public class ChatHistoryManager
    {
        private readonly ConcurrentDictionary<string, ChatHistory> _chatHistories = new ConcurrentDictionary<string, ChatHistory>();

        /// <summary>
        /// Gets the chat history for a specific user ID. Creates a new history if one does not exist.
        /// </summary>
        /// <param name="userId">The unique user identifier.</param>
        /// <returns>The ChatHistory object for the user.</returns>
        public ChatHistory GetChatHistory(string userId)
        {
            return _chatHistories.GetOrAdd(userId, _ => new ChatHistory());
        }
    }
}
