import createAsync from "../hooks/CreateAsync.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_COMP_URL = `${API_BASE_URL}/App`;

export class ChatApi {
  static sendMessageAsync() {
    const { data, isLoading, isError, post } = createAsync();

    async function sendMessage(message, userId) {
      const output = {
        text: message,
        userId: userId
      };
      
      try {
        const botResponse = await post(`${API_COMP_URL}/Chat`, output, {
          headers: { 'Content-Type': 'application/json' },
        });
        
        // Handle both old and new response formats for backward compatibility
        if (typeof botResponse === 'string') {
          // Old format - just a string response
          return {
            message: botResponse,
            questionType: 0, // Standard
            behavior: null
          };
        } else if (botResponse && typeof botResponse === 'object') {
          // New format - your actual backend response
          return {
            message: botResponse.message || botResponse.response || '',
            questionType: botResponse.questionType || 0, // Default to Standard (0)
            behavior: botResponse.behavior || null
          };
        } else {
          // Fallback for unexpected response format
          return {
            message: "Sorry, I couldn't process that request.",
            questionType: 0, // Standard
            behavior: null
          };
        }
      } catch (error) {
        console.error('Chat API Error:', error);
        throw error;
      }
    }

    return { sendMessage, isLoading, isError, data };
  }
}