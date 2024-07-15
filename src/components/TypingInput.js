import React from 'react';

const TypingInput = ({ userInput, onChange }) => {
  return (
    <input
      type="text"
      value={userInput}
      onChange={(e) => onChange(e.target.value)}
      autoFocus
    />
  );
};

export default TypingInput;
