import React, { useState, useEffect, useRef } from 'react';
import dictionary from './components/Dictionary.js';
import { shuffle } from './components/utils.js';
import './App.css';

const State = {
  REMAINING: 'REMAINING',
  ERROR: 'ERROR',
  TYPED: 'TYPED',
  SKIPPED: 'SKIPPED',
  SPACE_ERROR: 'SPACE_ERROR'
};

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [scoreData, setScoreData] = useState({ wpm: 0, accuracy: 0 });
  const [startTime, setStartTime] = useState(null);

  const textRef = useRef(null);
  const caretRef = useRef(null);

  useEffect(() => {
    if (showIntro) {
      const handleKeyDown = (e) => {
        if (e.key === ' ') {
          e.preventDefault();
          setShowIntro(false);
          startGame();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showIntro]);

  useEffect(() => {
    if (gameState) {
      const handleKeyDown = (e) => {
        e.preventDefault();
        handleTyping(e.key.toLowerCase());
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState && caretRef.current) {
      const currentElement = textRef.current.querySelector('.current');
      if (currentElement) {
        const bbox = currentElement.getBoundingClientRect();
        caretRef.current.style.left = `${bbox.left - 1}px`;
        caretRef.current.style.top = `${bbox.top}px`;
        caretRef.current.style.height = `${bbox.height}px`;
      }
    }
  }, [gameState]);

  const startGame = () => {
    const words = shuffle(dictionary).slice(0, 20);
    const text = words.join(' ');

    const initialState = {
      position: 0,
      sequence: Array.from(text).map((character) => ({
        character,
        state: State.REMAINING
      }))
    };

    setGameState(initialState);
    setShowIntro(false);
    setShowScore(false);
    setStartTime(null);
  };

  const handleTyping = (key) => {
    if (!gameState) return;

    const { position, sequence } = gameState;
    if (position >= sequence.length) return;

    const newSequence = [...sequence];
    const currentChar = newSequence[position];

    if (!startTime) {
      setStartTime(performance.now());
    }

    if (key === 'backspace') {
      if (position > 0) {
        newSequence[position - 1].state = State.REMAINING;
        setGameState({ position: position - 1, sequence: newSequence });
      }
    } else if (alphabet.has(key)) {
      if (key === ' ') {
        if (currentChar.character === ' ') {
          newSequence[position].state = State.TYPED;
          setGameState({
            position: position + 1,
            sequence: newSequence
          });
        } else {
          currentChar.state = State.SPACE_ERROR;
          setGameState({ position: position + 1, sequence: newSequence });
        }
      } else if (currentChar.character === key) {
        newSequence[position].state = State.TYPED;
        setGameState({ position: position + 1, sequence: newSequence });
      } else {
        currentChar.state = State.ERROR;
        setGameState({ position: position + 1, sequence: newSequence });
      }

      if (key === ' ' && currentChar.character !== ' ') {
        let nextPosition = position;
        while (nextPosition < newSequence.length && newSequence[nextPosition].character !== ' ') {
          newSequence[nextPosition].state = State.SKIPPED;
          nextPosition++;
        }
        setGameState({ position: nextPosition + 1, sequence: newSequence });
      }
    }

    if (position >= sequence.length) {
      endGame(newSequence);
    }
  };

  const endGame = (sequence) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    const wordCount = sequence.filter(part => part.state === State.TYPED && part.character === ' ').length + 1;
    const errors = sequence.filter(part => part.state === State.ERROR || part.state === State.SPACE_ERROR).length;
    const letterCount = sequence.length;

    const wpm = (wordCount / duration) * 60000;
    const accuracy = 1 - errors / letterCount;

    setScoreData({ wpm: Math.round(wpm), accuracy: Math.round(accuracy * 100) });
    setShowScore(true);
    setGameState(null);
  };

  const renderText = () => {
    if (!gameState) return null;

    return gameState.sequence.map(({ character, state }, idx) => {
      let className = '';
      switch (state) {
        case State.REMAINING:
          break;
        case State.ERROR:
          className = 'error';
          break;
        case State.SPACE_ERROR:
          className = 'space-error';
          break;
        case State.TYPED:
          className = 'correct';
          break;
        case State.SKIPPED:
          className = 'skipped';
          break;
        default:
          break;
      }
      if (idx === gameState.position) {
        className += ' current';
      }
      return (
        <span key={idx} className={className}>
          {character}
        </span>
      );
    });
  };

  return (
    <div className="App">
      {showIntro && <div id="intro">Press SPACE to start</div>}
      {!showIntro && !showScore && (
        <div id="game">
          <div id="text" ref={textRef}>
            {renderText()}
          </div>
          <div id="caret" ref={caretRef}></div>
        </div>
      )}
      {showScore && (
        <div id="score">
          <div id="wpm">WPM: {scoreData.wpm}</div>
          <div id="accuracy">Accuracy: {scoreData.accuracy}%</div>
          <div id="retry" onClick={() => setShowIntro(true)}>Press SPACE to retry</div>
        </div>
      )}
    </div>
  );
};

const alphabet = new Set(
  [...Array(26)].map((_, i) => String.fromCharCode(i + 'a'.charCodeAt(0)))
);
alphabet.add(' ');

export default App;