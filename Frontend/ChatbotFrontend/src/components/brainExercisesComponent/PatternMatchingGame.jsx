import React, { useState, useEffect } from 'react';

export default function PatternMatchingGame({ onComplete, onBack }) {
  const [gameState, setGameState] = useState('instructions');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [showingPattern, setShowingPattern] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3);
  const [levelScores, setLevelScores] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isCorrect, setIsCorrect] = useState(null);

  // Simplified levels - removed Expert and Master levels
  const levels = [
    { squares: 3, time: 3, name: 'Easy' },
    { squares: 4, time: 3, name: 'Medium' },
    { squares: 6, time: 4, name: 'Hard' }
  ];

  const maxAttempts = 3;

  useEffect(() => {
    if (showingPattern && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (showingPattern && timeLeft === 0) {
      setShowingPattern(false);
    }
  }, [showingPattern, timeLeft]);

  const generatePattern = (numSquares) => {
    const positions = [];
    const gridSize = 9; // 3x3 grid
    
    while (positions.length < numSquares) {
      const pos = Math.floor(Math.random() * gridSize);
      if (!positions.includes(pos)) {
        positions.push(pos);
      }
    }
    
    // Return just positions, no colors
    return positions;
  };

  // New helper function that takes level number as parameter
  const startLevelWithNumber = (levelNumber) => {
    const newPattern = generatePattern(levels[levelNumber - 1].squares);
    setPattern(newPattern);
    setUserPattern([]);
    setTimeLeft(levels[levelNumber - 1].time);
    setShowingPattern(true);
    setIsCorrect(null);
    setAttempts(0);
  };

  // Original startLevel function for initial level start
  const startLevel = () => {
    startLevelWithNumber(currentLevel);
  };

  const startGame = () => {
    setCurrentLevel(1);
    setLevelScores([]);
    startLevel();
    setGameState('playing');
  };

  const handleSquareClick = (position) => {
    if (showingPattern) return;

    if (userPattern.includes(position)) {
      // Remove square
      setUserPattern(userPattern.filter(pos => pos !== position));
    } else {
      // Add square
      setUserPattern([...userPattern, position]);
    }
  };

  const checkPattern = () => {
    if (userPattern.length !== pattern.length) {
      setIsCorrect(false);
      setAttempts(attempts + 1);
      return;
    }

    const isMatch = pattern.every(pos => userPattern.includes(pos));

    setIsCorrect(isMatch);
    
    if (isMatch) {
      // Level complete
      const score = Math.max(0, 100 - (attempts * 10));
      const newScores = [...levelScores, score];
      setLevelScores(newScores);
      
      setTimeout(() => {
        if (currentLevel < levels.length) {
          const nextLevel = currentLevel + 1;
          setCurrentLevel(nextLevel);
          // Use the next level value directly instead of relying on state
          startLevelWithNumber(nextLevel);
        } else {
          // Game complete
          const finalScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
          setGameState('complete');
          onComplete(finalScore);
        }
      }, 2000);
    } else {
      setAttempts(attempts + 1);
      if (attempts + 1 >= maxAttempts) {
        // Too many attempts, move to next level with 0 score
        const newScores = [...levelScores, 0];
        setLevelScores(newScores);
        
        setTimeout(() => {
          if (currentLevel < levels.length) {
            const nextLevel = currentLevel + 1;
            setCurrentLevel(nextLevel);
            // Use the next level value directly instead of relying on state
            startLevelWithNumber(nextLevel);
          } else {
            const finalScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
            setGameState('complete');
            onComplete(finalScore);
          }
        }, 2000);
      }
    }
  };

  const renderGrid = (patternToShow, interactive = false) => {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        maxWidth: '300px',
        margin: '0 auto'
      }}>
        {Array.from({ length: 9 }, (_, index) => {
          const isHighlighted = patternToShow.includes(index);
          
          return (
            <div
              key={index}
              onClick={() => interactive && handleSquareClick(index)}
              style={{
                width: '80px',
                height: '80px',
                backgroundColor: isHighlighted ? '#10b981' : '#374151',
                border: isHighlighted ? '3px solid #ffffff' : '2px solid #6b7280',
                borderRadius: '8px',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: isHighlighted ? '#ffffff' : '#9ca3af',
                fontWeight: '600'
              }}
            >
              {!isHighlighted && interactive && '+'}
            </div>
          );
        })}
      </div>
    );
  };


  if (gameState === 'instructions') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
              Pattern Matching
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', color: '#cbd5e1' }}>
              Study the pattern, then recreate it exactly on the grid!
            </p>
            
            <div style={{ textAlign: 'left', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>How to Play:</h3>
              <ul style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                <li>Watch the pattern carefully during the countdown</li>
                <li>Click empty squares to add them to your pattern</li>
                <li>Click highlighted squares to remove them</li>
                <li>Complete 3 levels of increasing difficulty</li>
                <li>You have 3 attempts per level</li>
              </ul>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Difficulty Levels:</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
                {levels.map((level, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600' }}>{level.name}</div>
                    <div style={{ color: '#cbd5e1' }}>{level.squares} squares</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={onBack}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back to Menu
              </button>
              <button
                onClick={startGame}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            width: '100%'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
                Level {currentLevel}: {levels[currentLevel - 1].name}
              </h3>
              <p style={{ color: '#cbd5e1', margin: '0' }}>
                {showingPattern ? 'Study the pattern!' : 'Recreate the pattern'}
              </p>
              {!showingPattern && (
                <p style={{ color: '#f59e0b', margin: '4px 0 0 0', fontSize: '14px' }}>
                  Attempt {attempts + 1} of {maxAttempts}
                </p>
              )}
            </div>

            {showingPattern && (
              <div style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#10b981',
                marginBottom: '20px'
              }}>
                {timeLeft}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              {renderGrid(showingPattern ? pattern : userPattern, !showingPattern)}
            </div>

            {showingPattern && (
              <div style={{
                height: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '20px'
              }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#10b981',
                    width: `${((levels[currentLevel - 1].time - timeLeft) / levels[currentLevel - 1].time) * 100}%`,
                    transition: 'width 1s linear'
                  }}
                />
              </div>
            )}

            {!showingPattern && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#cbd5e1' }}>
                  Pattern has {pattern.length} squares
                </div>
                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#cbd5e1' }}>
                  Your pattern: {userPattern.length} squares
                </div>
                
                {isCorrect === true && (
                  <div style={{ color: '#10b981', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    ✅ Perfect! Moving to next level...
                  </div>
                )}
                
                {isCorrect === false && (
                  <div style={{ color: '#ef4444', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                    ❌ Not quite right. {attempts >= maxAttempts ? 'Moving to next level...' : 'Try again!'}
                  </div>
                )}

                <button
                  onClick={checkPattern}
                  disabled={userPattern.length === 0 || isCorrect !== null}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: userPattern.length === 0 || isCorrect !== null ? '#64748b' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: userPattern.length === 0 || isCorrect !== null ? 'not-allowed' : 'pointer'
                  }}
                >
                  Check Pattern
                </button>
              </div>
            )}

            {!showingPattern && (
              <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'left' }}>
                <strong>Controls:</strong>
                <br />• Click empty squares to add them
                <br />• Click highlighted squares to remove them
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const finalScore = Math.round(levelScores.reduce((a, b) => a + b, 0) / levelScores.length);
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#1e293b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          color: '#f1f5f9'
        }}>
          <div style={{
            maxWidth: '600px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            backdropFilter: 'blur(10px)',
            width: '100%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {finalScore >= 80 ? '🏆' : finalScore >= 60 ? '🎯' : '👏'}
            </div>
            
            <h3 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>
              Pattern Challenge Complete!
            </h3>
            
            <div style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#10b981',
              marginBottom: '24px'
            }}>
              Final Score: {finalScore}%
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Level Breakdown:</h4>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
                {levelScores.map((score, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{levels[index].name}</div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{score}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>
                {finalScore >= 80 ? 'Outstanding visual memory! Your pattern recognition skills are excellent.' :
                 finalScore >= 60 ? 'Great job! Your visual attention and memory are developing well.' :
                 'Keep practicing! Pattern matching exercises strengthen visual memory and focus.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={onBack}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Back to Menu
              </button>
              <button
                onClick={startGame}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}