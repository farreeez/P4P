import React, { useState, useRef, useEffect, useContext } from "react";
import Header from "../shared/Header";
import "./ChatPage.css";
import { ChatApi } from "../../api/ChatApi";
import { AppContext } from "../../contexts/AppContextProvider";
import { TTS } from "../../api/ttsApi";
import { playAudioFromBase64 } from "../../utils/audioPlayer";

export default function ChatPage() {
  const { chatMessages, setChatMessages } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { sendMessage } = ChatApi.sendMessageAsync();
  const { synthesize } = TTS.synthesizeAsync();
  const [playingIndex, setPlayingIndex] = useState(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = {
      text: input,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendMessage(userMessage.text);
      const botMessage = {
        text: data.response || "Sorry, I couldn't process that request.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setChatMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        text: "Sorry, there was an error connecting to the server.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setChatMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Play TTS for a bot message
  const handlePlayTTS = async (text, index) => {
    try {
      setPlayingIndex(index);
      const ttsResponse = await synthesize(text);
      await playAudioFromBase64(ttsResponse);
    } catch (err) {
      console.error("TTS playback error:", err);
    } finally {
      setPlayingIndex(null);
    }
  };

  return (
    <div className="chat-container">
      <Header title="ChatBot" />
      <div className="messages-container">
        <div className="messages-list">
          {chatMessages.length === 0 ? (
            <div className="empty-chat-message">
              Send a message to start chatting!
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div
                key={index}
                className={`message-wrapper ${
                  message.sender === "user"
                    ? "user-message-wrapper"
                    : "bot-message-wrapper"
                }`}
                style={{ alignItems: "flex-end" }}
              >
                {/* Bot play button outside the bubble */}
                {message.sender === "bot" && !message.isError && (
                  <button
                    style={{
                      marginRight: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      verticalAlign: "middle",
                      padding: 0,
                      outline: "none",
                      alignSelf: "flex-start",
                    }}
                    title="Play message"
                    onClick={() => handlePlayTTS(message.text, index)}
                    disabled={playingIndex === index}
                  >
                    {playingIndex === index ? (
                      <span role="img" aria-label="Playing">
                        🔊
                      </span>
                    ) : (
                      <span role="img" aria-label="Play">
                        ▶️
                      </span>
                    )}
                  </button>
                )}
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
            className="button-primary"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
