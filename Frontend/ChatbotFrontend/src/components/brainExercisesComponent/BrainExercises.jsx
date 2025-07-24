import React, { useState } from "react";
import PatternMatchingGame from "./PatternMatchingGame";
import CategorySortingGame from "./CategorySortingGame";
import Header from "../shared/Header";

export default function BrainExercisesPage() {
  const [currentGame, setCurrentGame] = useState(null);
  const [gameStats, setGameStats] = useState({
    patternMatching: { played: 0, bestScore: 0 },
    categorySorting: { played: 0, bestScore: 0 },
  });

  const games = [
    {
      id: "patternMatching",
      title: "Pattern Matching",
      description: "Recreate colorful patterns on a grid",
      benefits: "Enhances visual memory and attention",
      icon: "🎯",
      color: "#10b981",
      difficulty: "Medium",
    },
    {
      id: "categorySorting",
      title: "Category Sorting",
      description: "Sort items into their correct categories",
      benefits: "Develops cognitive flexibility and reasoning",
      icon: "📊",
      color: "#f59e0b",
      difficulty: "Easy to Hard",
    },
  ];

  const handleGameSelect = (gameId) => {
    setCurrentGame(gameId);
  };

  const handleGameComplete = (gameId, score) => {
    setGameStats((prev) => ({
      ...prev,
      [gameId]: {
        played: prev[gameId].played + 1,
        bestScore: Math.max(prev[gameId].bestScore, score),
      },
    }));
    setCurrentGame(null);
  };

  const handleBackToMenu = () => {
    setCurrentGame(null);
  };

  if (currentGame) {
    const gameComponents = {
      patternMatching: (
        <PatternMatchingGame
          onComplete={(score) => handleGameComplete("patternMatching", score)}
          onBack={handleBackToMenu}
        />
      ),
      categorySorting: (
        <CategorySortingGame
          onComplete={(score) => handleGameComplete("categorySorting", score)}
          onBack={handleBackToMenu}
        />
      ),
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          background: "#1e293b",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        }}
      >
        <Header title="Brain Exercises" />
        {gameComponents[currentGame]}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#1e293b",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Header title="Brain Exercises" />

      {/* Content */}
      <div
        style={{ flex: 1, position: "relative", zIndex: 1, overflow: "auto" }}
      >
        {/* Title Section */}
        <div style={{ padding: "40px 24px 20px", textAlign: "center" }}>
          <h2
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "#f1f5f9",
              margin: "0 0 8px 0",
            }}
          >
            Train Your Mind
          </h2>
          <p
            style={{
              fontSize: "18px",
              color: "#cbd5e1",
              margin: "0 0 20px 0",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.5",
            }}
          >
            Fun and engaging games designed to keep your mind sharp and active
          </p>
        </div>

        {/* Games Grid */}
        <div
          style={{
            padding: "20px 24px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
          }}
        >
          {games.map((game) => (
            <div
              key={game.id}
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: `2px solid ${game.color}`,
                borderRadius: "16px",
                padding: "24px",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: "pointer",
              }}
            >
              {/* Game Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    backgroundColor: game.color,
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                  }}
                >
                  {game.icon}
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#f1f5f9",
                  }}
                >
                  {game.title}
                </h3>
              </div>

              <p
                style={{
                  color: "#cbd5e1",
                  fontSize: "16px",
                  lineHeight: "1.5",
                  margin: "0 0 16px 0",
                }}
              >
                {game.description}
              </p>

              <div
                style={{
                  color: "#e2e8f0",
                  fontSize: "14px",
                  marginBottom: "12px",
                }}
              >
                <strong>Benefits:</strong> {game.benefits}
              </div>

              <div
                style={{
                  color: "#e2e8f0",
                  fontSize: "14px",
                  marginBottom: "16px",
                }}
              >
                <strong>Difficulty:</strong> {game.difficulty}
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  padding: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Games Played
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#f1f5f9",
                    }}
                  >
                    {gameStats[game.id].played}
                  </div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                    Best Score
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#f1f5f9",
                    }}
                  >
                    {gameStats[game.id].bestScore}%
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleGameSelect(game.id)}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  backgroundColor: game.color,
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-2px)";
                  e.target.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0)";
                  e.target.style.boxShadow = "none";
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="20"
                  height="20"
                >
                  <polygon points="5,3 19,12 5,21"></polygon>
                </svg>
                Start Game
              </button>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div
          style={{
            padding: "40px 24px",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        ></div>
      </div>
    </div>
  );
}
