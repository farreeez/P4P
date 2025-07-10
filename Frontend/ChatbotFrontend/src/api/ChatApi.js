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
      const botResponse = await post(`${API_COMP_URL}/Chat`, output, {
        headers: { 'Content-Type': 'application/json' },
      });
      return botResponse;
    }

    return { sendMessage, isLoading, isError, data };
  }
}