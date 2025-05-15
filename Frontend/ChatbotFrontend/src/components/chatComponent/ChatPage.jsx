import React, { useState, useRef, useEffect } from "react";
import "./ChatPage.css";
import { ChatApi } from "../../api/ChatApi";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { sendMessage } = ChatApi.sendMessageAsync();

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendMessage(userMessage.text);

      // Add bot message
      const botMessage = {
        text: data.response|| "Sorry, I couldn't process that request.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);

      // Add error message
      const errorMessage = {
        text: "Sorry, there was an error connecting to the server.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>ChatBot</h1>

        <div className="font-buttons-container">
          <button className="font-button">
            +
          </button>

          <button className="font-button">
            -
          </button>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-chat-message">
              Send a message to start chatting!
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`message-wrapper ${
                  message.sender === "user"
                    ? "user-message-wrapper"
                    : "bot-message-wrapper"
                }`}
              >
                <div
                  className={`message ${
                    message.sender === "user"
                      ? "user-message"
                      : message.isError
                      ? "error-message"
                      : "bot-message"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="message-wrapper bot-message-wrapper">
              <div className="message bot-message">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && handleSubmit(e)}
            placeholder="Type your message here..."
            className="message-input"
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="send-button"
            aria-label="Send message"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
