// components/questionnaire/singleChoiceQuestion.tsx
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

interface SingleChoiceQuestionProps {
  question: string;
  options: any[];
  onAnswer: (answer: string) => void;
}

export default function SingleChoiceQuestion({ question, options, onAnswer }: SingleChoiceQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: any) => {
    setSelected(option.label);
    onAnswer(option.label);
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => (
        <motion.button
          key={index}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => handleSelect(option)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between group
            ${selected === option.label 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-green-500 hover:bg-green-50'}`}
        >
          <span className={`text-lg font-medium ${
            selected === option.label ? 'text-green-600' : 'text-gray-700'
          }`}>
            {option.label}
          </span>
          {selected === option.label && (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </motion.button>
      ))}
    </div>
  );
}