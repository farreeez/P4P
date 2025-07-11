import React, { useState, useRef, useEffect, useContext } from "react";
import Header from "../shared/Header";
import "./ChatPage.css";
import { ChatApi } from "../../api/ChatApi";
import {
  AppContext,
  AppContextProvider,
} from "../../contexts/AppContextProvider";
import { TTS } from "../../api/ttsApi";
import { playAudioFromBase64 } from "../../utils/audioPlayer";
import { STT } from "../../api/sttApi";

export default function ChatPage() {
  const { chatMessages, setChatMessages, currentUser } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { sendMessage } = ChatApi.sendMessageAsync();
  const { synthesize } = TTS.synthesizeAsync();
  const { transcribe } = STT.transcribeAsync();
  const [playingIndex, setPlayingIndex] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

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
      // Pass the current user's ID to the chat API
      const data = await sendMessage(userMessage.text, currentUser?.id);
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

  const handleMicClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        // Use default AudioContext (don't force sample rate)
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        const audioChunks = [];
        const originalSampleRate = audioContext.sampleRate;
        const targetSampleRate = 16000;

        console.log(
          `Original sample rate: ${originalSampleRate}Hz, target: ${targetSampleRate}Hz`
        );

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);

          // Downsample from original rate to 16kHz
          const downsampledData = downsample(
            inputData,
            originalSampleRate,
            targetSampleRate
          );

          // Convert Float32Array to Int16Array for WAV
          const int16Data = new Int16Array(downsampledData.length);
          for (let i = 0; i < downsampledData.length; i++) {
            int16Data[i] = Math.max(
              -32768,
              Math.min(32767, downsampledData[i] * 32768)
            );
          }
          audioChunks.push(int16Data);
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        setIsRecording(true);

        // Store references for stopping
        window.currentRecording = {
          stream,
          audioContext,
          processor,
          audioChunks,
        };
      } catch (err) {
        console.error("Microphone access error:", err);
      }
    } else {
      // Stop recording and process audio
      if (window.currentRecording) {
        const { stream, audioContext, processor, audioChunks } =
          window.currentRecording;

        processor.disconnect();
        audioContext.close();
        stream.getTracks().forEach((track) => track.stop());

        // Create WAV file at 16kHz
        const wavBlob = createWavFile(audioChunks, 16000);
        const file = new File([wavBlob], "recording.wav", {
          type: "audio/wav",
        });

        try {
          const sttResponse = await transcribe(file, {
            languageCode: "en-AU",
            audioEncoding: "LINEAR16",
            sampleRate: 16000,
          });
          setInput(sttResponse?.transcription || "");
        } catch (err) {
          console.error("STT error:", err);
        }

        // Clean up
        delete window.currentRecording;
      }
      setIsRecording(false);
    }
  };

  // Simple downsampling function
  function downsample(inputData, originalRate, targetRate) {
    if (originalRate === targetRate) {
      return inputData;
    }

    const ratio = originalRate / targetRate;
    const outputLength = Math.floor(inputData.length / ratio);
    const outputData = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const sourceIndex = Math.floor(i * ratio);
      outputData[i] = inputData[sourceIndex];
    }

    return outputData;
  }

  // Helper function to create WAV file at 16kHz
  function createWavFile(audioChunks, sampleRate) {
    const totalLength = audioChunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );
    const arrayBuffer = new ArrayBuffer(44 + totalLength * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + totalLength * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint32(20, 1, true); // PCM format
    view.setUint16(22, 1, true); // Mono channel
    view.setUint32(24, sampleRate, true); // 16000 Hz sample rate
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, "data");
    view.setUint32(40, totalLength * 2, true);

    // Audio data
    let offset = 44;
    audioChunks.forEach((chunk) => {
      for (let i = 0; i < chunk.length; i++) {
        view.setInt16(offset, chunk[i], true);
        offset += 2;
      }
    });

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  return (
    <div className="chat-container">
      <Header title="AI Assistant" />
      <div className="messages-container">
        <div className="messages-list">
          {chatMessages.length === 0 ? (
            <div className="empty-chat-message">
              <strong>Welcome!</strong>
              <br />
              Start a conversation by typing a message below or using the
              microphone.
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
              >
                {/* Bot play button with enhanced styling */}
                {message.sender === "bot" && !message.isError && (
                  <button
                    className="play-button"
                    title="Listen to message"
                    onClick={() => handlePlayTTS(message.text, index)}
                    disabled={playingIndex === index}
                    aria-label={
                      playingIndex === index
                        ? "Playing message"
                        : "Play message"
                    }
                  >
                    {playingIndex === index ? "🔊" : "▶️"}
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
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
            className="message-input"
            rows="1"
            style={{
              resize: "none",
              overflow: "hidden",
              minHeight: "24px",
              height: "auto",
            }}
            onInput={(e) => {
              // Auto-resize textarea
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`action-button mic-button ${
              isRecording ? "recording" : ""
            }`}
            title={isRecording ? "Stop Recording" : "Start Voice Recording"}
            aria-label={
              isRecording ? "Stop recording" : "Start voice recording"
            }
          >
            {isRecording ? "⏹️" : "🎤"}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            className="action-button send-button"
            title="Send Message"
            aria-label="Send message"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22,2 15,22 11,13 2,9"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
