import React from "react";
import { motion } from 'framer-motion';

interface MultipleChoiceQuestionProps {
  question: string;
  options: { label: string; nextNodeId?: string }[];
  onAnswer: (answers: string[]) => void;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

  const handleOptionChange = (optionLabel: string) => {
    setSelectedOptions((prevSelected) => {
      const newSelected = prevSelected.includes(optionLabel)
        ? prevSelected.filter((label) => label !== optionLabel)
        : [...prevSelected, optionLabel];
      onAnswer(newSelected);
      return newSelected;
    });
  };

  const fadeInUpVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  return (
    <motion.div initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInUpVariants}
    transition={{ duration: 0.5 }}  className="p-4">
      <h3 className="mb-6 text-4xl font-semibold text-gray-700">{question}</h3>
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
    </motion.div>
  );
};

export default MultipleChoiceQuestion;
