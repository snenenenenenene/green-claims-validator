// components/questionnaire/multipleChoiceQuestion.tsx
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";

interface MultipleChoiceQuestionProps {
  question: string;
  options: any[];
  onAnswer: (answers: string[]) => void;
}

export default function MultipleChoiceQuestion({ question, options, onAnswer }: MultipleChoiceQuestionProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (option: any) => {
    const newSelected = selected.includes(option.label)
      ? selected.filter(item => item !== option.label)
      : [...selected, option.label];

    setSelected(newSelected);
    onAnswer(newSelected);
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
            ${selected.includes(option.label)
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-500 hover:bg-green-50'}`}
        >
          <span className={`text-lg font-medium ${selected.includes(option.label) ? 'text-green-600' : 'text-gray-700'
            }`}>
            {option.label}
          </span>
          {selected.includes(option.label) && (
            <Check className="h-5 w-5 text-green-500" />
          )}
        </motion.button>
      ))}
    </div>
  );
}