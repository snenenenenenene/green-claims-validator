
'use client'

// components/ButtonList.tsx
import React, { useState } from 'react';

interface OptionListProps {
  options: {text:string, target: number}[];
  questionIndex: number;
}

const OptionList: React.FC<OptionListProps> = ({ options, questionIndex }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleButtonClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <ul className='mt-2'>
      {options.map((option, index) => (
        <li className='flex items-center' key={index}>
            <input
                type="radio"
                name={`${questionIndex}`}
                className={`m-2 h-4 w-4 border-2 rounded-full cursor-pointer text-green focus:ring-green bg-white border-gray-300'}`}
                checked={activeIndex === index}
                onChange={() => handleButtonClick(index)}
                id={`option-${questionIndex}-${index}`} // Unique ID for accessibility
            >
            </input>
          <label htmlFor={`option-${questionIndex}-${index}`} className="cursor-pointer">
            {option.text}
          </label>
        </li>
      ))}
    </ul>
  );
};

export default OptionList;
