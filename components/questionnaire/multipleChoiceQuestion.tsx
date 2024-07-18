import React, { useState } from "react";

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  onAnswer: (answer: string[]) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionClick = (option: string) => {
    setSelectedOptions((prevSelectedOptions) =>
      prevSelectedOptions.includes(option)
        ? prevSelectedOptions.filter((opt) => opt !== option)
        : [...prevSelectedOptions, option]
    );
    onAnswer(
      selectedOptions.includes(option)
        ? selectedOptions.filter((opt) => opt !== option)
        : [...selectedOptions, option]
    );
  };

  return (
    <div className="p-4">
      <h3 className="text-lg mb-4">{question}</h3>
      <div className="form-control">
        {options.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text">{option}</span>
            <input
              type="checkbox"
              className="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={() => handleOptionClick(option)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default MultipleChoiceQuestion;
