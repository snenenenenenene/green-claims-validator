"use client";
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import { generateQuestionsFromChart, getNextNode } from "@/lib/utils";

export default function QuestionnairePage() {
  const { chartInstances, currentTab, setCurrentTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
  }));

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [onePageMode, setOnePageMode] = useState(false);

  useEffect(() => {
    if (currentTab !== "Default") {
      setCurrentTab("Default");
    } else {
      const currentInstance = chartInstances.find(
        (instance) => instance.name === currentTab,
      );

      if (currentInstance) {
        setOnePageMode(currentInstance.onePageMode || false);
        const generatedQuestions = generateQuestionsFromChart(currentInstance);
        console.log("Generated Questions:", generatedQuestions);
        setQuestions(generatedQuestions);
      }
    }
  }, [chartInstances, currentTab, setCurrentTab]);

  const handleAnswer = (answer) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    const currentInstance = chartInstances.find(
      (instance) => instance.name === currentTab,
    );

    let nextNodeId;

    if (currentQuestion.type === "singleChoice") {
      const selectedOption = currentQuestion.options.find(
        (option) => option.label === currentAnswer,
      );
      nextNodeId =
        selectedOption?.nextNodeId ||
        getNextNode(
          currentQuestion.id,
          currentInstance.initialEdges,
          `option-${currentAnswer}-next`,
        );
    } else {
      nextNodeId = getNextNode(
        currentQuestion.id,
        currentInstance.initialEdges,
        currentAnswer,
      );
    }

    if (!nextNodeId) {
      if (currentQuestion.type === "endNode") {
        if (currentQuestion.redirectTab) {
          const redirectInstance = chartInstances.find(
            (instance) => instance.name === currentQuestion.redirectTab,
          );

          if (redirectInstance) {
            setCurrentTab(currentQuestion.redirectTab);
            const generatedQuestions =
              generateQuestionsFromChart(redirectInstance);
            setQuestions(generatedQuestions);
            setCurrentQuestionIndex(0);
          } else {
            toast.error("Redirect tab not found.");
            window.location.href = "/";
          }
        } else {
          toast.success("Questionnaire completed!");
          window.location.href = "/";
        }
        return;
      } else {
        toast.success("Questionnaire completed!");
        window.location.href = "/";
        return;
      }
    }

    const nextQuestionIndex = questions.findIndex(
      (question) => question.id === nextNodeId,
    );

    if (nextQuestionIndex !== -1) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      toast.success("Questionnaire completed!");
      window.location.href = "/";
    }
  };

  const renderQuestion = (question, onAnswer) => {
    switch (question.type) {
      case "yesNo":
        return (
          <YesNoQuestion question={question.question} onAnswer={onAnswer} />
        );
      case "singleChoice":
        return (
          <SingleChoiceQuestion
            question={question.question}
            options={question.options}
            onAnswer={onAnswer}
          />
        );
      case "multipleChoice":
        return (
          <MultipleChoiceQuestion
            question={question.question}
            options={question.options}
            onAnswer={onAnswer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 flex h-full w-full flex-col overflow-y-scroll px-60 text-dark-gray">
      <div className="flex justify-center font-roboto text-3xl">
        <p>Be a hero, fly carbon zero</p>
      </div>
      <div className="mx-0.2 m-8 rounded-3xl bg-light-gray">
        {onePageMode ? (
          questions.map((question, index) => (
            <div key={index}>{renderQuestion(question, handleAnswer)}</div>
          ))
        ) : (
          <>
            {questions[currentQuestionIndex] &&
              renderQuestion(questions[currentQuestionIndex], handleAnswer)}
            <button
              type="button"
              className="hover:bg-green-800 focus:ring-green-300 mb-8 ml-8 rounded-full bg-green px-10 py-2.5 text-white focus:outline-none focus:ring-4"
              onClick={handleNextQuestion}
            >
              Volgende
            </button>
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}
