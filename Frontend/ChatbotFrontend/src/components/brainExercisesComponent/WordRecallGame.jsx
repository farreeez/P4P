import React, { useState, useEffect } from "react";

export default function WordRecallGame({ onComplete, onBack }) {
  const [gameState, setGameState] = useState("instructions"); // instructions, studying, recalling, results
  const [currentRound, setCurrentRound] = useState(1);
  const [currentWords, setCurrentWords] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [recalledWords, setRecalledWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const [roundScores, setRoundScores] = useState([]);
  const [currentScore, setCurrentScore] = useState(0);

  // New Zealand themed word categories
  const wordCategories = {
    animals: [
      "Kiwi",
      "Tuatara",
      "Kakapo",
      "Weta",
      "Pukeko",
      "Tui",
      "Kereru",
      "Takahe",
      "Hoiho",
      "Weka",
    ],
    food: [
      "Pavlova",
      "Hangi",
      "Hokey Pokey",
      "Kumara",
      "Feijoa",
      "Manuka",
      "Anzac",
      "Lamington",
      "Paua",
      "Moa",
    ],
    places: [
      "Auckland",
      "Wellington",
      "Rotorua",
      "Queenstown",
      "Taupo",
      "Napier",
      "Nelson",
      "Dunedin",
      "Palmerston",
      "Hamilton",
    ],
    nature: [
      "Pohutukawa",
      "Kauri",
      "Fern",
      "Glacier",
      "Fiord",
      "Geyser",
      "Alpine",
      "Beach",
      "Forest",
      "Mountain",
    ],
  };

  const totalRounds = 3;
  const wordsPerRound = [5, 6, 7]; // Increasing difficulty

  useEffect(() => {
    if (gameState === "studying" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "studying" && timeLeft === 0) {
      setGameState("recalling");
    }
  }, [gameState, timeLeft]);

  const generateWords = (count) => {
    const categories = Object.keys(wordCategories);
    const selectedCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const categoryWords = [...wordCategories[selectedCategory]];

    // Shuffle and select words
    const shuffled = categoryWords.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const startRound = () => {
    const words = generateWords(wordsPerRound[currentRound - 1]);
    setCurrentWords(words);
    setTimeLeft(10);
    setGameState("studying");
    setUserInput("");
    setRecalledWords([]);
  };

  const startGame = () => {
    setCurrentRound(1);
    setRoundScores([]);
    startRound();
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleSubmitWord = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      const word = userInput.trim();
      if (!recalledWords.includes(word)) {
        setRecalledWords([...recalledWords, word]);
      }
      setUserInput("");
    }
  };

  const finishRecall = () => {
    // Calculate score for this round
    const correctWords = recalledWords.filter((word) =>
      currentWords.some(
        (original) => original.toLowerCase() === word.toLowerCase()
      )
    );
    const score = Math.round((correctWords.length / currentWords.length) * 100);

    const newRoundScores = [...roundScores, score];
    setRoundScores(newRoundScores);
    setCurrentScore(score);

    if (currentRound < totalRounds) {
      setGameState("roundResult");
    } else {
      // Game finished
      const finalScore = Math.round(
        newRoundScores.reduce((a, b) => a + b, 0) / newRoundScores.length
      );
      setGameState("gameComplete");
      onComplete(finalScore);
    }
  };

  const nextRound = () => {
    setCurrentRound(currentRound + 1);
    startRound();
  };

  const correctWords = recalledWords.filter((word) =>
    currentWords.some(
      (original) => original.toLowerCase() === word.toLowerCase()
    )
  );

  if (gameState === "instructions") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1e293b",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧠</div>
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 16px 0",
            }}
          >
            Word Recall Challenge
          </h2>
          <p
            style={{
              fontSize: "16px",
              lineHeight: "1.6",
              marginBottom: "24px",
              color: "#cbd5e1",
            }}
          >
            Test your memory by studying words for 10 seconds, then recall as
            many as you can!
          </p>

          <div style={{ textAlign: "left", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "18px", marginBottom: "12px" }}>
              How to Play:
            </h3>
            <ul style={{ color: "#cbd5e1", lineHeight: "1.6" }}>
              <li>Round 1: Remember 5 words</li>
              <li>Round 2: Remember 6 words</li>
              <li>Round 3: Remember 7 words</li>
              <li>Study each list for 10 seconds</li>
              <li>Type the words you remember</li>
            </ul>
          </div>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={onBack}
              style={{
                padding: "12px 24px",
                backgroundColor: "#64748b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Back to Menu
            </button>
            <button
              onClick={startGame}
              style={{
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "studying") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1e293b",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0" }}>
              Round {currentRound} of {totalRounds}
            </h3>
            <p style={{ color: "#cbd5e1", margin: "0" }}>
              Study these words carefully
            </p>
          </div>

          <div
            style={{
              fontSize: "48px",
              fontWeight: "700",
              color: "#3b82f6",
              marginBottom: "20px",
            }}
          >
            {timeLeft}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            {currentWords.map((word, index) => (
              <div
                key={index}
                style={{
                  padding: "16px",
                  background: "rgba(59, 130, 246, 0.2)",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                {word}
              </div>
            ))}
          </div>

          <div
            style={{
              height: "4px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#3b82f6",
                width: `${((10 - timeLeft) / 10) * 100}%`,
                transition: "width 1s linear",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (gameState === "recalling") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1e293b",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            width: "100%",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h3 style={{ fontSize: "20px", margin: "0 0 8px 0" }}>
              Round {currentRound} - Recall Time!
            </h3>
            <p style={{ color: "#cbd5e1", margin: "0" }}>
              Type the words you remember (one at a time)
            </p>
          </div>

          <form onSubmit={handleSubmitWord} style={{ marginBottom: "24px" }}>
            <input
              type="text"
              value={userInput}
              onChange={handleInputChange}
              placeholder="Type a word and press Enter"
              style={{
                width: "100%",
                padding: "12px 16px",
                fontSize: "16px",
                border: "2px solid #3b82f6",
                borderRadius: "8px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "#f1f5f9",
                marginBottom: "12px",
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
                marginRight: "12px",
              }}
            >
              Add Word
            </button>
          </form>

          {recalledWords.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "16px", marginBottom: "12px" }}>
                Words you've entered ({recalledWords.length}):
              </h4>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  justifyContent: "center",
                }}
              >
                {recalledWords.map((word, index) => {
                  const isCorrect = currentWords.some(
                    (original) => original.toLowerCase() === word.toLowerCase()
                  );
                  return (
                    <span
                      key={index}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "14px",
                        backgroundColor: isCorrect ? "#10b981" : "#ef4444",
                        color: "white",
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={finishRecall}
            style={{
              padding: "12px 24px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Finish Round
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "roundResult") {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1e293b",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {currentScore >= 80 ? "🎉" : currentScore >= 60 ? "👍" : "💪"}
          </div>

          <h3 style={{ fontSize: "24px", margin: "0 0 16px 0" }}>
            Round {currentRound} Complete!
          </h3>

          <div
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#3b82f6",
              marginBottom: "24px",
            }}
          >
            {currentScore}%
          </div>

          <div style={{ marginBottom: "24px", textAlign: "left" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "12px" }}>
              Round Summary:
            </h4>
            <p style={{ color: "#cbd5e1", margin: "0 0 8px 0" }}>
              Correct words: {correctWords.length} out of {currentWords.length}
            </p>

            <div style={{ marginBottom: "12px" }}>
              <strong>Original words:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "4px",
                  marginTop: "4px",
                }}
              >
                {currentWords.map((word, index) => (
                  <span
                    key={index}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      backgroundColor: "rgba(59, 130, 246, 0.3)",
                      color: "#f1f5f9",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={nextRound}
            style={{
              padding: "12px 24px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Next Round ({currentRound + 1}/{totalRounds})
          </button>
        </div>
      </div>
    );
  }

  if (gameState === "gameComplete") {
    const finalScore = Math.round(
      roundScores.reduce((a, b) => a + b, 0) / roundScores.length
    );

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          background: "#1e293b",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
            backdropFilter: "blur(10px)",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            {finalScore >= 80 ? "🏆" : finalScore >= 60 ? "🎉" : "👏"}
          </div>

          <h3 style={{ fontSize: "24px", margin: "0 0 16px 0" }}>
            Game Complete!
          </h3>

          <div
            style={{
              fontSize: "36px",
              fontWeight: "700",
              color: "#3b82f6",
              marginBottom: "24px",
            }}
          >
            Final Score: {finalScore}%
          </div>

          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "12px" }}>
              Round Breakdown:
            </h4>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              {roundScores.map((score, index) => (
                <div key={index} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                    Round {index + 1}
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: "600" }}>
                    {score}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              marginBottom: "24px",
              padding: "16px",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              borderRadius: "8px",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1" }}>
              {finalScore >= 80
                ? "Excellent memory! Your recall abilities are outstanding."
                : finalScore >= 60
                ? "Good job! Your memory skills are developing well."
                : "Keep practicing! Regular brain exercises will improve your memory."}
            </p>
          </div>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={onBack}
              style={{
                padding: "12px 24px",
                backgroundColor: "#64748b",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Back to Menu
            </button>
            <button
              onClick={startGame}
              style={{
                padding: "12px 24px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
