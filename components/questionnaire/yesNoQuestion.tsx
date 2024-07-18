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
    <div className="p-4">
      <h3 className="mb-4 text-lg">{question}</h3>
      <div className="form-control w-full flex-row justify-between">
        <button
          className={`btn btn-wide ${
            selectedOption === "yes" ? "btn-active" : ""
          }`}
          onClick={() => handleOptionChange("yes")}
        >
          Yes
        </button>
        <button
          className={`btn btn-wide ${
            selectedOption === "no" ? "btn-active" : ""
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
