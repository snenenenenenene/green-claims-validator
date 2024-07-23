import React from "react";

interface SingleChoiceQuestionProps {
  question: string;
  options: { label: string; nextNodeId?: string }[];
  onAnswer: (answer: string) => void;
}

const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  console.log(options);
  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg">{question}</h3>
      <div className="form-control">
        {options.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text">{option.label}</span>
            <input
              type="radio"
              name="single-choice"
              className="radio"
              onClick={() => onAnswer(option.label)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default SingleChoiceQuestion;
