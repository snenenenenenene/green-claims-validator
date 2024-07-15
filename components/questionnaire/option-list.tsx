
'use client'

// components/ButtonList.tsx
import React, { useState } from 'react';

interface OptionListProps {
  options: {text:string, target: number}[];
}

const OptionList: React.FC<OptionListProps> = ({ options }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleButtonClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <ul>
      {options.map((option, index) => (
        <li>
            <button
                key={index}
                onClick={() => handleButtonClick(index)}
                className={`px-4 py-2 m-2 border ${activeIndex === index ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
            >
            </button>
            <label>{option.text}</label>
        </li>
      ))}
    </ul>
  );
};

export default OptionList;
