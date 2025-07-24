import React, { useState, useEffect } from 'react';

export default function CategorySortingGame({ onComplete, onBack }) {
  const [gameState, setGameState] = useState('instructions');
  const [currentRound, setCurrentRound] = useState(1);
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sortedItems, setSortedItems] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [roundScores, setRoundScores] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);

  const gameData = [
    {
      round: 1,
      title: "Animals vs Food",
      categories: [
        { name: "Animals", color: "#10b981", emoji: "🐾" },
        { name: "Food", color: "#f59e0b", emoji: "🍽️" }
      ],
      items: [
        { name: "Kiwi Bird", category: "Animals", emoji: "🥝" },
        { name: "Pavlova", category: "Food", emoji: "🍰" },
        { name: "Sheep", category: "Animals", emoji: "🐑" },
        { name: "Fish & Chips", category: "Food", emoji: "🍟" },
        { name: "Dolphin", category: "Animals", emoji: "🐬" },
        { name: "Meat Pie", category: "Food", emoji: "🥧" },
        { name: "Penguin", category: "Animals", emoji: "🐧" },
        { name: "Kumara", category: "Food", emoji: "🍠" }
      ]
    },
    {
      round: 2,
      title: "Indoor vs Outdoor",
      categories: [
        { name: "Indoor", color: "#3b82f6", emoji: "🏠" },
        { name: "Outdoor", color: "#10b981", emoji: "🌳" }
      ],
      items: [
        { name: "Sofa", category: "Indoor", emoji: "🛋️" },
        { name: "Tree", category: "Outdoor", emoji: "🌲" },
        { name: "Television", category: "Indoor", emoji: "📺" },
        { name: "Garden", category: "Outdoor", emoji: "🌻" },
        { name: "Bed", category: "Indoor", emoji: "🛏️" },
        { name: "Beach", category: "Outdoor", emoji: "🏖️" },
        { name: "Kitchen", category: "Indoor", emoji: "🍳" },
        { name: "Mountain", category: "Outdoor", emoji: "⛰️" }
      ]
    },
    {
      round: 3,
      title: "Transport, Tools & Clothes",
      categories: [
        { name: "Transport", color: "#3b82f6", emoji: "🚗" },
        { name: "Tools", color: "#ef4444", emoji: "🔧" },
        { name: "Clothes", color: "#8b5cf6", emoji: "👕" }
      ],
      items: [
        { name: "Car", category: "Transport", emoji: "🚙" },
        { name: "Hammer", category: "Tools", emoji: "🔨" },
        { name: "Shirt", category: "Clothes", emoji: "👔" },
        { name: "Bus", category: "Transport", emoji: "🚌" },
        { name: "Screwdriver", category: "Tools", emoji: "🪛" },
        { name: "Hat", category: "Clothes", emoji: "🎩" },
        { name: "Bicycle", category: "Transport", emoji: "🚲" },
        { name: "Shoes", category: "Clothes", emoji: "👞" },
        { name: "Saw", category: "Tools", emoji: "🪚" }
      ]
    }
  ];

  const totalRounds = gameData.length;

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameStarted && timeLeft === 0) {
      finishRound();
    }
  }, [gameStarted, timeLeft]);

  // New helper function that takes round number as parameter
  const startRoundWithNumber = (roundNumber) => {
    const roundData = gameData[roundNumber - 1];
    setCategories(roundData.categories);
    setItems([...roundData.items].sort(() => Math.random() - 0.5)); // Shuffle items
    setSortedItems({});
    setTimeLeft(60);
    setGameStarted(true);
  };

  // Original startRound function for initial round start
  const startRound = () => {
    startRoundWithNumber(currentRound);
  };

  const startGame = () => {
    setCurrentRound(1);
    setRoundScores([]);
    startRound();
    setGameState('playing');
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, categoryName) => {
    e.preventDefault();
    if (draggedItem) {
      setSortedItems(prev => ({
        ...prev,
        [draggedItem.name]: categoryName
      }));
      setDraggedItem(null);
    }
  };

  const handleItemClick = (item) => {
    // For mobile/touch devices - cycle through categories
    const currentCategory = sortedItems[item.name];
    const currentIndex = categories.findIndex(cat => cat.name === currentCategory);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % categories.length;
    
    if (nextIndex === 0 && currentIndex !== -1) {
      // Remove from category
      const newSorted = { ...sortedItems };
      delete newSorted[item.name];
      setSortedItems(newSorted);
    } else {
      setSortedItems(prev => ({
        ...prev,
        [item.name]: categories[nextIndex].name
      }));
    }
  };

  const removeFromCategory = (itemName) => {
    const newSorted = { ...sortedItems };
    delete newSorted[itemName];
    setSortedItems(newSorted);
  };

  const finishRound = () => {
    setGameStarted(false);
    
    // Calculate score
    const roundData = gameData[currentRound - 1];
    const correctItems = roundData.items.filter(item => 
      sortedItems[item.name] === item.category
    );
    const score = Math.round((correctItems.length / roundData.items.length) * 100);
    
    const newScores = [...roundScores, score];
    setRoundScores(newScores);
    
    if (currentRound < totalRounds) {
      setGameState('roundResult');
    } else {
      // Game complete
      const finalScore = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
      setGameState('complete');
      onComplete(finalScore);
    }
  };

  // Fixed nextRound function
  const nextRound = () => {
    const nextRoundNumber = currentRound + 1;
    setCurrentRound(nextRoundNumber);
    startRoundWithNumber(nextRoundNumber); // Use the next round number directly
    setGameState('playing');
  };

  const getItemsInCategory = (categoryName) => {
    return Object.entries(sortedItems)
      .filter(([itemName, category]) => category === categoryName)
      .map(([itemName]) => items.find(item => item.name === itemName))
      .filter(Boolean);
  };

  const getUnsortedItems = () => {
    return items.filter(item => !sortedItems[item.name]);
  };

  if (gameState === 'instructions') {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#1e293b',
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 16px 0' }}>
            Category Sorting
          </h2>
          <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', color: '#cbd5e1' }}>
            Sort items into their correct categories as quickly and accurately as possible!
          </p>
          
          <div style={{ textAlign: 'left', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>How to Play:</h3>
            <ul style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
              <li>Drag items from the bottom to the correct category</li>
              <li>Or click items to cycle through categories</li>
              <li>You have 60 seconds per round</li>
              <li>Complete 3 rounds with increasing difficulty</li>
              <li>Click items in categories to remove them</li>
            </ul>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Rounds:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
              {gameData.map((round, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>Round {round.round}: {round.title}</span>
                  <span style={{ color: '#cbd5e1' }}>{round.items.length} items</span>
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
                backgroundColor: '#f59e0b',
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
    );
  }

  if (gameState === 'playing') {
    const roundData = gameData[currentRound - 1];
    const unsortedItems = getUnsortedItems();
    
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        background: '#1e293b',
        color: '#f1f5f9'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>
            Round {currentRound}: {roundData.title}
          </h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: timeLeft <= 10 ? '#ef4444' : '#f59e0b'
            }}>
              ⏱️ {timeLeft}s
            </div>
            <div style={{ fontSize: '16px', color: '#cbd5e1' }}>
              Sorted: {Object.keys(sortedItems).length}/{items.length}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
          gap: '16px',
          marginBottom: '20px',
          flex: 1
        }}>
          {categories.map((category) => {
            const categoryItems = getItemsInCategory(category.name);
            
            return (
              <div
                key={category.name}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.name)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: `2px solid ${category.color}`,
                  borderRadius: '12px',
                  padding: '16px',
                  minHeight: '200px',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: category.color
                }}>
                  <span style={{ fontSize: '20px' }}>{category.emoji}</span>
                  {category.name}
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#cbd5e1',
                    marginLeft: 'auto'
                  }}>
                    ({categoryItems.length})
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {categoryItems.map((item) => (
                    <div
                      key={item.name}
                      onClick={() => removeFromCategory(item.name)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: category.color,
                        color: 'white',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>{item.emoji}</span>
                      <span>{item.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '12px', opacity: 0.7 }}>✕</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Unsorted Items */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ 
            fontSize: '16px', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📦</span>
            Items to Sort ({unsortedItems.length})
          </h4>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {unsortedItems.map((item) => (
              <div
                key={item.name}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleItemClick(item)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#374151',
                  border: '2px solid #6b7280',
                  borderRadius: '8px',
                  cursor: 'grab',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseDown={(e) => e.target.style.cursor = 'grabbing'}
                onMouseUp={(e) => e.target.style.cursor = 'grab'}
              >
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          
          {unsortedItems.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: '#10b981',
              fontSize: '16px',
              fontWeight: '600',
              padding: '20px'
            }}>
              🎉 All items sorted! 
              <button
                onClick={finishRound}
                style={{
                  marginLeft: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Finish Round
              </button>
            </div>
          )}
        </div>

        {/* Controls hint */}
        <div style={{
          marginTop: '12px',
          fontSize: '12px',
          color: '#9ca3af',
          textAlign: 'center'
        }}>
          💡 Drag items to categories or click to cycle through options
        </div>
      </div>
    );
  }

  if (gameState === 'roundResult') {
    const roundData = gameData[currentRound - 1];
    const currentScore = roundScores[roundScores.length - 1];
    const correctItems = roundData.items.filter(item => 
      sortedItems[item.name] === item.category
    );
    
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#1e293b',
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
            {currentScore >= 80 ? '🏆' : currentScore >= 60 ? '🎯' : '👍'}
          </div>
          
          <h3 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>
            Round {currentRound} Complete!
          </h3>
          
          <div style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#f59e0b',
            marginBottom: '24px'
          }}>
            {currentScore}%
          </div>

          <div style={{ marginBottom: '24px', textAlign: 'left' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Round Summary:</h4>
            <p style={{ color: '#cbd5e1', margin: '0 0 12px 0' }}>
              Correctly sorted: {correctItems.length} out of {roundData.items.length} items
            </p>
            
            <div style={{ marginBottom: '12px' }}>
              <strong>Correct answers:</strong>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {correctItems.map((item, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: 'rgba(16, 185, 129, 0.3)',
                      color: '#f1f5f9'
                    }}
                  >
                    {item.emoji} {item.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={nextRound}
            style={{
              padding: '12px 24px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Next Round ({currentRound + 1}/{totalRounds})
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    const finalScore = Math.round(roundScores.reduce((a, b) => a + b, 0) / roundScores.length);
    
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: '#1e293b',
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
            {finalScore >= 80 ? '🏆' : finalScore >= 60 ? '🎉' : '👏'}
          </div>
          
          <h3 style={{ fontSize: '24px', margin: '0 0 16px 0' }}>
            Sorting Challenge Complete!
          </h3>
          
          <div style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#f59e0b',
            marginBottom: '24px'
          }}>
            Final Score: {finalScore}%
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Round Breakdown:</h4>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              {roundScores.map((score, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Round {index + 1}</div>
                  <div style={{ fontSize: '18px', fontWeight: '600' }}>{score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1' }}>
              {finalScore >= 80 ? 'Excellent categorization skills! Your cognitive flexibility and reasoning are superb.' :
               finalScore >= 60 ? 'Great work! Your sorting and classification abilities are developing well.' :
               'Keep practicing! Category sorting helps develop logical thinking and mental organization.'}
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
                backgroundColor: '#f59e0b',
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
    );
  }

  return null;
}