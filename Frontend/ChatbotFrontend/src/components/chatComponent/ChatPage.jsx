import React, { useState, useRef, useEffect, useContext } from "react";
import Header from "../shared/Header";
import "./ChatPage.css";
import { ChatApi } from "../../api/ChatApi";
import { AppContext } from "../../contexts/AppContextProvider";
import { TTS } from "../../api/ttsApi";
import { playAudioFromBase64 } from "../../utils/audioPlayer";
import { STT } from "../../api/sttApi";

// Question type enum matching your backend
const AssessmentQuestionType = {
  Standard: 0,
  SimpleAssessment: 1,
  MemoryRecall: 2,
  VerbalOnly: 3,
  TimedVerbal: 4,
};

// Lightweight SVGs (inline, no external deps)
const Icon = {
  // Speaker with waves
  speaker: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z"></path>
      <path d="M15.54 8.46a5 5 0 010 7.07M18.07 5.93a9 9 0 010 12.73"></path>
    </svg>
  ),
  // Simple play triangle (used as alt state)
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  // Microphone
  mic: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <path d="M12 19v3" />
    </svg>
  ),
  // Stop (recording)
  stop: (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="black"
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  // User avatar (outline person)
  user: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  // Bot avatar (rounded square with face)
  bot: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="14" rx="4" />
      <path d="M12 4V2" />
      <circle cx="9" cy="11" r="1.5" />
      <circle cx="15" cy="11" r="1.5" />
    </svg>
  ),
};

export default function ChatPage() {
  const { chatMessages, setChatMessages, currentUser, ttsSpeed, setTtsSpeed } = useContext(AppContext);
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

  // New states for dementia assessment
  const [currentQuestionType, setCurrentQuestionType] = useState(
    AssessmentQuestionType.Standard
  );
  const [currentAssessmentBehavior, setCurrentAssessmentBehavior] =
    useState(null);
  const [isTextInputDisabled, setIsTextInputDisabled] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [lastBotMessageIndex, setLastBotMessageIndex] = useState(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerExpiredSent, setTimerExpiredSent] = useState(false);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Timer effect
  useEffect(() => {
    if (showTimer && timeRemaining > 0 && timerStarted) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setShowTimer(false);
            if (!timerExpiredSent) {
              handleTimerExpired();
              setTimerExpiredSent(true);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [showTimer, timeRemaining, timerStarted]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const startDementiaAssessmnt = (e) => {
    e.preventDefault();
    handleSubmit(null, true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleTimerExpired = () => {
    const timeUpMessage = {
      text: "Time's up! Please proceed to answer or move to the next question.",
      sender: "system",
      timestamp: new Date().toISOString(),
      isSystemMessage: true,
    };
    setChatMessages((prevMessages) => [...prevMessages, timeUpMessage]);
  };

  const isAssessmentQuestion = (questionType) => {
    return questionType > AssessmentQuestionType.Standard;
  };

  const handleAssessmentResponse = async (responseData) => {
    const { behavior, questionType } = responseData;
    setCurrentQuestionType(questionType);
    setCurrentAssessmentBehavior(behavior);

    if (behavior) {
      setIsTextInputDisabled(behavior.requiresVoice);

      if (behavior.requiresReadAloud) {
        try {
          const ttsResponse = await synthesize(responseData.message);
          await playAudioFromBase64(ttsResponse);
        } catch (err) {
          console.error("Auto TTS playback error:", err);
        }
      }

      if (behavior.hideAfterDelay && behavior.hideDelaySeconds) {
        setTimeout(() => {
          setChatMessages((prevMessages) => {
            const newMessages = [...prevMessages];
            if (lastBotMessageIndex !== null) {
              newMessages[newMessages.length - 1] = {
                ...newMessages[newMessages.length - 1],
                isHidden: true,
              };
            }
            return newMessages;
          });
        }, behavior.hideDelaySeconds * 1000);
      }

      if (behavior.hasTimer && behavior.timerDurationSeconds) {
        setTimeRemaining(behavior.timerDurationSeconds);
        setShowTimer(true);
        setTimerStarted(false);
        setTimerExpiredSent(false);
      }
    }
  };

  const handleSubmit = async (e, isAssesment = false) => {
    if (e) {
      e.preventDefault();
    }

    if (!input.trim() && !isAssesment) return;

    let userMessage;

    if (isAssesment) {
      userMessage = {
        text: "start dementia assessment",
        sender: "user",
        timestamp: new Date().toISOString(),
      };
    } else {
      userMessage = {
        text: input,
        sender: "user",
        timestamp: new Date().toISOString(),
      };
    }

    setChatMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);

    if (showTimer) {
      setShowTimer(false);
      setTimerStarted(false);
      setTimerExpiredSent(false);
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }

    try {
      const data = await sendMessage(userMessage.text, currentUser?.id);

      const botMessage = {
        text: data.message || "Sorry, I couldn't process that request.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        questionType: data.questionType,
        behavior: data.behavior,
      };

      setChatMessages((prevMessages) => {
        const newMessages = [...prevMessages, botMessage];
        return newMessages;
      });

      setLastBotMessageIndex(chatMessages.length);

      if (isAssessmentQuestion(data.questionType)) {
        await handleAssessmentResponse(data);
      } else {
        setCurrentQuestionType(AssessmentQuestionType.Standard);
        setCurrentAssessmentBehavior(null);
        setIsTextInputDisabled(false);
        setShowTimer(false);
        setTimerStarted(false);
        setTimerExpiredSent(false);
      }
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

        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();

        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);

        const audioChunks = [];
        const originalSampleRate = audioContext.sampleRate;
        const targetSampleRate = 16000;

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const downsampledData = downsample(
            inputData,
            originalSampleRate,
            targetSampleRate
          );
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

        if (showTimer && !timerStarted) {
          setTimerStarted(true);
        }

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
      if (window.currentRecording) {
        const { stream, audioContext, processor, audioChunks } =
          window.currentRecording;

        processor.disconnect();
        audioContext.close();
        stream.getTracks().forEach((track) => track.stop());

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

          const transcribedText = sttResponse?.transcription || "";
          setInput(transcribedText);

          if (isTextInputDisabled && transcribedText.trim()) {
            setTimeout(() => {
              const submitEvent = { preventDefault: () => {} };
              handleSubmit(submitEvent);
            }, 100);
          }
        } catch (err) {
          console.error("STT error:", err);
        }

        delete window.currentRecording;
      }
      setIsRecording(false);
    }
  };

  const adjustTTSSpeed = (increment) => {
    setTtsSpeed(prev => {
      const newSpeed = Math.round((prev + increment) * 10) / 10;
      return Math.min(Math.max(newSpeed, 0.4), 2.0);
    });
  };

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

  function createWavFile(audioChunks, sampleRate) {
    const totalLength = audioChunks.reduce(
      (sum, chunk) => sum + chunk.length,
      0
    );
    const arrayBuffer = new ArrayBuffer(44 + totalLength * 2);
    const view = new DataView(arrayBuffer);

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
    view.setUint32(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, totalLength * 2, true);

    let offset = 44;
    audioChunks.forEach((chunk) => {
      for (let i = 0; i < chunk.length; i++) {
        view.setInt16(offset, chunk[i], true);
        offset += 2;
      }
    });

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  const getQuestionTypeDisplay = (questionType) => {
    switch (questionType) {
      case AssessmentQuestionType.SimpleAssessment:
        return "Assessment Question";
      case AssessmentQuestionType.MemoryRecall:
        return "Memory Recall";
      case AssessmentQuestionType.VerbalOnly:
        return "Verbal Response Only";
      case AssessmentQuestionType.TimedVerbal:
        return "Timed Verbal Response";
      default:
        return null;
    }
  };

  // Small avatar next to message
  const Avatar = ({ sender }) => (
    <div
      className={`message-avatar ${
        sender === "user" ? "user-avatar" : "bot-avatar"
      }`}
      aria-hidden
    >
      {sender === "user" ? Icon.user : Icon.bot}
    </div>
  );

  return (
    <div className="chat-container">
      {/* Header already styled via CSS; we add a title icon via CSS ::before */}
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
                className={`message-row ${
                  message.sender === "user" ? "user-row" : "bot-row"
                }`}
              >
                {/* Left-side cluster for bot/system: avatar + TTS */}
                {(message.sender === "bot" || message.sender === "system") && (
                  <div className="left-cluster">
                    <Avatar sender="bot" />
                    {!message.isError && (
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
                        {Icon.play}
                      </button>
                    )}
                  </div>
                )}

                {/* Bubble */}
                <div
                  className={`message ${
                    message.sender === "user"
                      ? "user-message"
                      : message.isError
                      ? "error-message"
                      : message.sender === "system"
                      ? "system-message"
                      : "bot-message"
                  } ${message.isHidden ? "hidden-message" : ""} ${
                    message.questionType &&
                    isAssessmentQuestion(message.questionType)
                      ? "assessment-question"
                      : ""
                  }`}
                >
                  {message.isHidden ? (
                    <div className="hidden-question-placeholder">
                      <em>Question hidden - please answer from memory</em>
                    </div>
                  ) : (
                    message.text
                  )}
                </div>

                {/* Right-side avatar for user messages */}
                {message.sender === "user" && (
                  <div className="right-cluster">
                    <Avatar sender="user" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="message-row bot-row">
              <div className="left-cluster">
                <Avatar sender="bot" />
              </div>
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

      {/* Timer Display */}
      {showTimer && (
        <div className="timer-container">
          <div className="timer-display">
            <span className="timer-icon">⏱️</span>
            <span className="timer-text">
              {timerStarted
                ? `Time remaining: ${timeRemaining}s`
                : "Click microphone to start timer"}
            </span>
          </div>
        </div>
      )}

      {/* Assessment Instructions */}
      {isAssessmentQuestion(currentQuestionType) &&
        currentAssessmentBehavior && (
          <div className="assessment-instructions">
            <div className="instruction-content">
              <span className="question-type-indicator">
                {getQuestionTypeDisplay(currentQuestionType)}
              </span>
              {currentAssessmentBehavior.requiresVoice && (
                <span className="voice-only-indicator">
                  🎤 Voice response required
                </span>
              )}
              {currentAssessmentBehavior.hasTimer && (
                <span className="timer-indicator">⏱️ Timed question</span>
              )}
              {currentAssessmentBehavior.hideAfterDelay && (
                <span className="memory-indicator">🧠 Remember the words</span>
              )}
            </div>
          </div>
        )}

      <div className="input-container">
        <div className="speed-control-wrapper">
          <span className="speed-label">Speech Speed:</span>
          <button
            onClick={() => adjustTTSSpeed(-0.1)}
            className="action-button speed-button"
            title="Decrease Speed"
            aria-label="Decrease speech speed"
          >
            -
          </button>
          <span className="speed-value">{ttsSpeed.toFixed(1)}x</span>
          <button
            onClick={() => adjustTTSSpeed(0.1)}
            className="action-button speed-button"
            title="Increase Speed"
            aria-label="Increase speech speed"
          >
            +
          </button>
        </div>
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
            placeholder={
              isTextInputDisabled
                ? "Voice response required - use microphone"
                : "Type your message here..."
            }
            className="message-input"
            rows="1"
            disabled={isTextInputDisabled}
            style={{
              resize: "none",
              overflow: "hidden",
              minHeight: "24px",
              height: "auto",
              opacity: isTextInputDisabled ? 0.5 : 1,
            }}
            onInput={(e) => {
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
            } ${isTextInputDisabled ? "required" : ""}`}
            title={isRecording ? "Stop Recording" : "Start Voice Recording"}
            aria-label={
              isRecording ? "Stop recording" : "Start voice recording"
            }
          >
            {isRecording ? Icon.stop : Icon.mic}
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
          <button
            onClick={startDementiaAssessmnt}
            className="action-button send-button"
            title="Start Assessment"
            aria-label="Start Assessment"
          >
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
