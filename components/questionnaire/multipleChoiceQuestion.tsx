import React from "react";

interface MultipleChoiceQuestionProps {
  question: string;
  options: { label: string; nextNodeId?: string }[];
  onAnswer: (answers: string[] | string) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}: {
  question: string;
  options: { label: string; nextNodeId?: string }[];
  onAnswer: (answers: string[]) => void;
}) => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  const handleOptionChange = (optionLabel: string) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(optionLabel)) {
        return prevSelected.filter((label) => label !== optionLabel);
      } else {
        return [...prevSelected, optionLabel];
      }
    });
  };

  const handleSubmit = () => {
    onAnswer(selectedOptions);
  };

  return (
    <div className="p-4">
      <h3 className="mb-4 text-lg">{question}</h3>
      <div className="form-control">
        {options.map((option, index) => (
          <label key={index} className="label cursor-pointer">
            <span className="label-text">{option.label}</span>
            <input
              type="checkbox"
              className="checkbox"
              onChange={() => handleOptionChange(option.label)}
            />
          </label>
        ))}
      </div>
      <button
        type="button"
        className="mt-4 rounded bg-blue-500 px-4 py-2 text-white"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default MultipleChoiceQuestion;
