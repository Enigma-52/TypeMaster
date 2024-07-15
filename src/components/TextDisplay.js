import React, { useEffect, useRef } from 'react';

const TextDisplay = ({ text, userInput }) => {
  const textRef = useRef();

  useEffect(() => {
    if (textRef.current) {
      textRef.current.focus();
    }
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Backspace') {
      userInput.setUserInput(userInput.input.slice(0, -1));
    } else if (e.key.length === 1) {
      userInput.setUserInput(userInput.input + e.key);
    }
  };

  return (
    <div
      className="text-display"
      tabIndex="0"
      ref={textRef}
      onKeyDown={handleKeyPress}
    >
      {text.split('').map((char, index) => {
        let className = '';
        if (index < userInput.input.length) {
          className = char === userInput.input[index] ? 'correct' : 'incorrect';
        }
        if (index === userInput.input.length) {
          className += ' cursor';
        }
        return (
          <span key={index} className={className}>
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default TextDisplay;
