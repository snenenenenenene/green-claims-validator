"use client";

import React, { useEffect, useState } from "react";
import useStore from "@/lib/store";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import { Toaster, toast } from "react-hot-toast";
import { generateQuestionsFromChart, getNextNode } from "@/lib/utils";

const renderQuestion = (question, onAnswer) => {
  switch (question.type) {
    case "yesNo":
      return (
        <YesNoQuestion
          key={question.id}
          question={question.question}
          onAnswer={onAnswer}
        />
      );
    case "singleChoice":
      return (
        <SingleChoiceQuestion
          key={question.id}
          question={question.question}
          options={question.options}
          onAnswer={onAnswer}
        />
      );
    case "multipleChoice":
      return (
        <MultipleChoiceQuestion
          key={question.id}
          question={question.question}
          options={question.options}
          onAnswer={onAnswer}
        />
      );
    default:
      return null;
  }
};

export default function QuestionnairePage() {
  const { chartInstances, currentTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
  }));

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);

  useEffect(() => {
    const currentInstance = chartInstances.find(
      (instance) => instance.name === currentTab,
    );
    if (currentInstance) {
      const generatedQuestions = generateQuestionsFromChart(currentInstance);
      setQuestions(generatedQuestions);
      setCurrentQuestionId(generatedQuestions[0]?.id || null);
    }
  }, [chartInstances, currentTab]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    const currentInstance = chartInstances.find(
      (instance) => instance.name === currentTab,
    );
    if (!currentInstance) {
      return;
    }

    console.log("currentQuestionIndex", currentQuestionIndex);
    console.log(currentQuestionId)

    const { initialEdges } = currentInstance;
    const nextNodeId = getNextNode(
      currentQuestionId,
      initialEdges,
      answers[currentQuestionIndex],
    );

    if (nextNodeId) {
      const nextQuestionIndex = questions.findIndex((q) => q.id === nextNodeId);
      if (nextQuestionIndex !== -1) {
        setCurrentQuestionIndex(nextQuestionIndex);
        setCurrentQuestionId(nextNodeId);
      } else {
        toast.success("Questionnaire completed!");
      }
    } else {
      toast.success("Questionnaire completed!");
    }
  };

  const currentInstance = chartInstances.find(
    (instance) => instance.name === currentTab,
  );
  const onePageMode = currentInstance?.onePageMode || false;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="flex-center mt-6 flex h-full w-full flex-col overflow-y-scroll px-60 text-dark-gray">
      <div className="flex justify-center font-roboto text-3xl">
        <p>Be a hero, fly carbon zero</p>
      </div>
      <div className="mx-0.2 m-8 rounded-3xl bg-light-gray">
        {onePageMode ? (
          questions.map((question, index) => (
            <div key={index}>
              {renderQuestion(question, (answer) => handleAnswer(answer))}
            </div>
          ))
        ) : (
          <>
            {currentQuestion && renderQuestion(currentQuestion, handleAnswer)}
            {currentQuestionIndex < questions.length - 1 && (
              <button
                type="button"
                className="hover:bg-green-800 focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800 mb-2 mb-8 me-2 ml-8 rounded-full bg-green px-10 px-5 py-2.5 text-center font-medium text-sm text-white focus:outline-none focus:ring-4"
                onClick={handleNextQuestion}
              >
                Volgende
              </button>
            )}
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}
