import React from "react";

interface SingleChoiceQuestionProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
}

const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  return (
    <div className="p-4">
      <h3 className="text-lg mb-4">{question}</h3>
      <div className="form-control">
        {options.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text">{option}</span>
            <input
              type="radio"
              name="single-choice"
              className="radio"
              onClick={() => onAnswer(option)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default SingleChoiceQuestion;
