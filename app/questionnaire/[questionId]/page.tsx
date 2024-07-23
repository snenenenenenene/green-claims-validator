// app/questionnaire/[questionId]/page.tsx

"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import { generateQuestionsFromChart, getNextNode } from "@/lib/utils";

export default function QuestionPage() {
  const { questionId } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { chartInstances, currentTab, setCurrentTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
  }));

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [onePageMode, setOnePageMode] = useState(false);
  const claim = searchParams.get('claim') || "Be a hero, fly carbon zero";

  useEffect(() => {
    if (currentTab) {
      const currentInstance = chartInstances.find(instance => instance.name === currentTab);

      if (currentInstance) {
        setOnePageMode(currentInstance.onePageMode || false);
        const generatedQuestions = generateQuestionsFromChart(currentInstance);
        setQuestions(generatedQuestions);
        const questionIndex = generatedQuestions.findIndex(question => question.id === questionId);
        if (questionIndex !== -1) {
          setCurrentQuestionIndex(questionIndex);
        }
      }
    }
  }, [chartInstances, currentTab, questionId]);

  const handleAnswer = (answer: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    const currentInstance = chartInstances.find(instance => instance.name === currentTab) as any;

    let nextNodeId: string | null = null;

    if (currentQuestion.type === "singleChoice") {
      const selectedOption = currentQuestion.options.find(
        (option: any) => option.label === currentAnswer
      );
      nextNodeId =
        selectedOption?.nextNodeId ||
        getNextNode(currentQuestion.id, currentInstance.initialEdges, `option-${currentAnswer}-next`);
    } else {
      nextNodeId = getNextNode(currentQuestion.id, currentInstance.initialEdges, currentAnswer);
    }

    if (nextNodeId) {
      const nextNode = questions.find(question => question.id === nextNodeId);

      if (nextNode) {
        router.push(`/questionnaire/${nextNode.id}?claim=${encodeURIComponent(claim)}`);
        setCurrentQuestionIndex(questions.findIndex(q => q.id === nextNodeId));
        return;
      }
    }

    if (currentQuestion.endType === "redirect") {
      const redirectInstance = chartInstances.find(instance => instance.name === currentQuestion.redirectTab);

      if (redirectInstance) {
        setCurrentTab(currentQuestion.redirectTab);
        const generatedQuestions = generateQuestionsFromChart(redirectInstance);
        setQuestions(generatedQuestions);
        setCurrentQuestionIndex(0);
        setAnswers({});
        router.replace(`/questionnaire/${generatedQuestions[0].id}?claim=${encodeURIComponent(claim)}`);
        return;
      } else {
        toast.error("Redirect tab not found.");
      }
    }

    toast.success("Questionnaire completed!");
    setCurrentTab("Default");
    router.push("/questionnaire/results"); // Redirect to results page
  };

  const renderQuestion = (question: any, onAnswer: (answer: string) => void) => {
    switch (question.type) {
      case "yesNo":
        return <YesNoQuestion question={question.question} onAnswer={onAnswer} />;
      case "singleChoice":
        return (
          <SingleChoiceQuestion question={question.question} options={question.options} onAnswer={onAnswer} />
        );
      case "multipleChoice":
        return (
          <MultipleChoiceQuestion question={question.question} options={question.options} onAnswer={onAnswer as any} />
        );
      default:
        return null;
    }
  };

  const progressValue = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex h-screen w-full flex-col justify-between px-48 text-dark-gray">
      <div className="my-6 flex justify-center font-roboto text-3xl">
        <p>{claim}</p>
      </div>
      <div className="w-full px-8 pb-4">
        <div className="relative h-12 w-full rounded-full bg-gray-200 p-2 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green transition-all duration-500 ease-in-out dark:bg-green"
            style={{ width: `${progressValue}%` }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              {Math.round(progressValue)}%
            </span>
          </div>
        </div>
      </div>
      <div className="mx-8 my-4 mb-auto flex min-h-[30%] flex-col rounded-3xl bg-light-gray p-8">
        {onePageMode ? (
          questions.map((question, index) => (
            <div key={index} className="mb-auto">
              {renderQuestion(question, handleAnswer)}
            </div>
          ))
        ) : (
          <>
            {questions[currentQuestionIndex] && renderQuestion(questions[currentQuestionIndex], handleAnswer)}
            <button
              type="button"
              className="hover:bg-green-800 focus:ring-green-300 mt-auto w-40 rounded-full bg-green px-10 py-2.5 text-white focus:outline-none focus:ring-4"
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
