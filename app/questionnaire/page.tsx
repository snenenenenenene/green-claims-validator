"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import { generateQuestionsFromChart, getNextNode } from "@/lib/utils";

export default function QuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chartInstances, setCurrentQuestionnaireTab, resetCurrentWeight, getCurrentWeight } = useStore((state) => ({
    chartInstances: state.chartInstances,
    setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
    resetCurrentWeight: state.resetCurrentWeight,
    getCurrentWeight: state.getCurrentWeight,
  }));

  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const chart = searchParams.get('chart');
  const questionId = searchParams.get('question');
  const claim = searchParams.get('claim') || "Be a hero, fly carbon zero";

  useEffect(() => {
    console.log("useEffect triggered - Initial loading");

    if (chartInstances.length > 0 && !isRedirecting) {
      loadQuestion(chart, questionId);
    }
  }, [chartInstances, chart, questionId]);

  const loadQuestion = (chart: string | null, questionId: string | null) => {
    console.log("Loading question based on query parameters");

    const currentInstance = chartInstances.find(instance => instance.name === chart);

    if (!currentInstance) {
      console.error("Chart instance not found");
      return;
    }

    setCurrentQuestionnaireTab(currentInstance.name);

    const generatedQuestions = generateQuestionsFromChart(currentInstance);
    console.log("Generated Questions:", generatedQuestions);

    const foundQuestion = generatedQuestions.find(q => q.id === questionId);

    if (foundQuestion) {
      console.log("Found question:", JSON.stringify(foundQuestion, null, 2));
      setQuestions(generatedQuestions);
      setCurrentQuestion(foundQuestion);
    } else {
      console.log("Question not found, redirecting to the first valid question.");
      const firstValidQuestion = generatedQuestions.find(q => !q.skipRender);
      if (firstValidQuestion) {
        router.replace(`/questionnaire?chart=${currentInstance.name}&question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
      } else {
        console.error("No valid question found in the generated questions.");
      }
    }
  };

  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    console.log("Handling next question. Current question:", currentQuestion);

    const nextNodeId = determineNextNodeId(currentQuestion);
    console.log("Determined next node ID:", nextNodeId);

    if (!nextNodeId) {
      console.error("No next node ID found, stopping.");
      return;
    }

    const nextNode = findQuestionById(nextNodeId);
    console.log("Next node found in all questions:", nextNode);

    if (nextNode) {
      handleNodeRedirection(nextNode);
    } else {
      console.error("Next question not found in any chart.");
    }
  };

  const determineNextNodeId = (currentQuestion: any): string | null => {
    let nextNodeId: string | null = null;

    if (currentQuestion.type === "singleChoice" || currentQuestion.type === "yesNo") {
      const selectedOption = currentQuestion.options?.find(
        (option: any) => option.label === selectedAnswer
      );

      if (selectedOption && selectedOption.nextQuestionId) {
        nextNodeId = selectedOption.nextQuestionId;
      } else {
        nextNodeId = getNextNode(currentQuestion.id, chartInstances.find(instance => instance.name === chart).initialEdges, selectedAnswer);
      }
    }

    console.log("Next Node ID:", nextNodeId);
    return nextNodeId;
  };

  const findQuestionById = (questionId: string) => {
    for (const instance of chartInstances) {
      const foundQuestion = instance.initialNodes.find((node: any) => node.id === questionId);
      if (foundQuestion) {
        console.log(`Found question ${questionId} in chart ${instance.name}`);
        return foundQuestion;
      }
    }
    return null;
  };

  const handleNodeRedirection = (nextNode: any) => {
    console.log("Handling node redirection to:", nextNode);

    if (nextNode.type === "endNode") {
      console.log("Next node is an end node, handling end node...");
      handleEndNode(nextNode);
    } else {
      console.log("Redirecting to next question:", nextNode.id);
      router.replace(`/questionnaire?chart=${chart}&question=${nextNode.id}&claim=${encodeURIComponent(claim)}`);
    }
  };

  const handleEndNode = (nextNode: any) => {
    console.log("Handling end node:", nextNode);

    if (nextNode.endType === "redirect" && nextNode.redirectTab) {
      setIsRedirecting(true);
      const redirectInstance = chartInstances.find(instance => instance.name === nextNode.redirectTab);
      if (redirectInstance) {
        console.log("Redirecting to another chart:", nextNode.redirectTab);
        setCurrentQuestionnaireTab(redirectInstance.name);
        resetCurrentWeight();
        const generatedQuestions = generateQuestionsFromChart(redirectInstance);
        setQuestions(generatedQuestions);
        const firstValidQuestion = generatedQuestions.find(q => !q.skipRender);
        if (firstValidQuestion) {
          router.replace(`/questionnaire?chart=${nextNode.redirectTab}&question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
        }
      } else {
        toast.error("Redirect tab not found.");
        setIsRedirecting(false);
      }
    } else {
      toast.success("Questionnaire completed!");
      router.push(`/questionnaire/results?weight=${getCurrentWeight()}`);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col justify-between px-10 lg:px-20 xl:px-28 text-dark-gray">
      <div className="my-6 flex justify-center font-roboto text-3xl">
        <p>{claim}</p>
      </div>
      <div className="w-full px-8 pb-4">
        <div className="relative h-12 w-full rounded-full bg-gray-200 p-2 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green transition-all duration-500 ease-in-out dark:bg-green"
            style={{ width: `${((questions.findIndex(q => q.id === questionId) + 1) / questions.length) * 100}%` }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              {Math.round(((questions.findIndex(q => q.id === questionId) + 1) / questions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
      <div className="mx-8 my-4 mb-auto flex min-h-[30%] flex-col rounded-3xl bg-light-gray p-8">
        {currentQuestion ? (
          currentQuestion.type === "yesNo" ? (
            <YesNoQuestion question={currentQuestion.question} onAnswer={setSelectedAnswer} />
          ) : currentQuestion.type === "singleChoice" ? (
            <SingleChoiceQuestion question={currentQuestion.label} options={currentQuestion.data.options} onAnswer={setSelectedAnswer} />
          ) : currentQuestion.type === "multipleChoice" ? (
            <MultipleChoiceQuestion question={currentQuestion.label} options={currentQuestion.data.options} onAnswer={setSelectedAnswer as any} />
          ) : <div>Unknown question type: {currentQuestion.type}</div>

        ) : <div>No question available</div>}
        <button
          type="button"
          className={`hover:bg-green-800 focus:ring-green-300 mt-auto w-40 rounded-full bg-green px-10 py-2.5 text-white focus:outline-none focus:ring-4 ${!selectedAnswer ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleNextQuestion}
          disabled={!selectedAnswer}
        >
          Volgende
        </button>
      </div>
      <Toaster />
    </div>
  );
}
