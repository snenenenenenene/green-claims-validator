import React from "react";
import { motion } from 'framer-motion';

interface SingleChoiceQuestionProps {
  question: string;
  options: { label: string; nextNodeId?: string }[];
  onAnswer: (answer: string) => void;
}

const fadeInUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

const SingleChoiceQuestion: React.FC<SingleChoiceQuestionProps> = ({
  question,
  options,
  onAnswer,
}) => {
  return (
    <motion.div initial="initial"
    animate="animate"
    exit="exit"
    variants={fadeInUpVariants}
    transition={{ duration: 0.5 }} className="p-4">
      <h3 className="mb-6 text-4xl font-semibold text-gray-700">
        {question}
      </h3>
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
    </motion.div>
  );
};

export default SingleChoiceQuestion;
