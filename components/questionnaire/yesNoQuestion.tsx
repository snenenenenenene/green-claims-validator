import React, { useState } from "react";

interface YesNoQuestionProps {
  question: string;
  onAnswer: (answer: string) => void;
}

const YesNoQuestion: React.FC<YesNoQuestionProps> = ({
  question,
  onAnswer,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
    onAnswer(option);
  };

  return (
    <div className="rounded-lg p-6">
      <h3 className="mb-6 text-4xl font-semibold text-gray-700">{question}</h3>
      <div className="flex">
        <button
          className={`btn ${
            selectedOption === "yes" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => handleOptionChange("yes")}
        >
          Yes
        </button>
        <button
          className={`btn ${
            selectedOption === "no" ? "btn-primary" : "btn-outline"
          }`}
          onClick={() => handleOptionChange("no")}
        >
          No
        </button>
      </div>
    </div>
  );
};

export default YesNoQuestion;
