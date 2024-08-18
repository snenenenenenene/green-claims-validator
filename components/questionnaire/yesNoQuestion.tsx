import { motion } from "framer-motion";
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
      transition={{ duration: 0.5 }} className="rounded-lg">
      <h3 className="mb-6 text-4xl font-semibold text-gray-700">{question}</h3>
      <div className="flex w-full gap-x-4">
        <button
          className={`btn w-1/2 ${selectedOption === "yes" ? "btn-neutral" : "btn-outline"
            }`}
          onClick={() => handleOptionChange("yes")}
        >
          Yes
        </button>
        <button
          className={`btn w-1/2 ${selectedOption === "no" ? "btn-neutral" : "btn-outline"
            }`}
          onClick={() => handleOptionChange("no")}
        >
          No
        </button>
      </div>
    </motion.div>
  );
};

export default YesNoQuestion;
