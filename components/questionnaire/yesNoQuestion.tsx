// components/questionnaire/yesNoQuestion.tsx
import { motion } from "framer-motion";

interface YesNoQuestionProps {
  question: string;
  options: any[];
  onAnswer: (answer: string) => void;
}

export default function YesNoQuestion({ question, options, onAnswer }: YesNoQuestionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {options.map((option, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAnswer(option.label)}
            className="flex items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group"
          >
            <span className="text-lg font-medium text-gray-700 group-hover:text-green-600">
              {option.label.charAt(0).toUpperCase() + option.label.slice(1)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}