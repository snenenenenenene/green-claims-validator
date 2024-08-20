"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import { generateQuestionsFromAllCharts } from "@/lib/utils";

export default function QuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { chartInstances, resetCurrentWeight, getCurrentWeight, updateCurrentWeight } = useStore((state) => ({
    chartInstances: state.chartInstances,
    resetCurrentWeight: state.resetCurrentWeight,
    getCurrentWeight: state.getCurrentWeight,
    updateCurrentWeight: state.setCurrentWeight,
  }));

  const [questions, setQuestions] = useState<any[]>([]);
  const [visualQuestions, setVisualQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);

  const questionId = searchParams.get("question");
  const claim = searchParams.get("claim") || "Be a hero, fly carbon zero";

  useEffect(() => {
    console.log("useEffect triggered - Initial loading");

    if (chartInstances.length > 0) {
      loadQuestion(questionId);
    }
  }, [chartInstances, questionId]);

  const loadQuestion = (questionId: string | null) => {
    console.log("Loading question based on query parameters");

    if (!questionId) {
      resetCurrentWeight(); // Reset weight at the start of a new questionnaire
    }

    const generatedQuestions = generateQuestionsFromAllCharts(chartInstances);
    console.log("Generated Questions:", generatedQuestions);

    // Filter out non-visual questions for the progress bar
    const visualOnlyQuestions = generatedQuestions.filter(
      (q) => !["weightNode", "startNode", "endNode"].includes(q.type)
    );

    setVisualQuestions(visualOnlyQuestions);

    const foundQuestion = generatedQuestions.find((q) => q.id === questionId);

    if (foundQuestion) {
      normalizeOptions(foundQuestion);
      console.log("Found question:", JSON.stringify(foundQuestion, null, 2));
      setQuestions(generatedQuestions);
      setCurrentQuestion(foundQuestion);
    } else {
      console.log("Question not found, redirecting to the first valid question.");
      const firstValidQuestion = generatedQuestions.find((q) => !q.skipRender);
      if (firstValidQuestion) {
        router.replace(`/questionnaire?question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
      } else {
        console.error("No valid question found in the generated questions.");
      }
    }
  };

  const normalizeOptions = (question: any) => {
    if (question.data && Array.isArray(question.data.options)) {
      question.data.options = question.data.options.map((option: any) => {
        if (typeof option === "string") {
          return { label: option, nextNodeId: null };
        }
        return option;
      });
    }
  };

  useEffect(() => {
    if (currentQuestion) {
      handleCurrentQuestion(currentQuestion);
    }
  }, [currentQuestion]);

  const handleCurrentQuestion = (question: any) => {
    if (["weightNode", "startNode", "endNode"].includes(question.type)) {
      processNode(question);
    }
  };

  const processNode = (question: any) => {
    if (question.type === "weightNode") {
      const weightToAdd = question.data.weight || 1;
      const currentWeight = getCurrentWeight();
      console.log(`Current weight before update: ${currentWeight}`);
      console.log(`Multiplying weight by ${weightToAdd}`);
      const newWeight = currentWeight * weightToAdd;
      updateCurrentWeight(newWeight); // Multiply the current weight
      console.log(`New weight after update: ${newWeight}`);
    }

    if (question.type === "endNode") {
      handleEndNode(question);
    } else {
      moveToNextNode(question.data.nextNodeId || question.options?.[0]?.nextNodeId);
    }
  };

  const moveToNextNode = (nextNodeId: string | null) => {
    if (nextNodeId) {
      console.log(`Moving to next question with ID: ${nextNodeId}`);
      router.replace(`/questionnaire?question=${nextNodeId}&claim=${encodeURIComponent(claim)}`);
    } else {
      console.error("No next node ID found for moving.");
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
      const selectedOption = currentQuestion.data.options?.find(
        (option: any) => option.label === selectedAnswer
      );

      if (selectedOption && selectedOption.nextNodeId) {
        nextNodeId = selectedOption.nextNodeId;
      }
    } else if (currentQuestion.type === "multipleChoice") {
      const defaultOption = currentQuestion.data.options?.find(
        (option: any) => option.label === "DEFAULT"
      );
      if (defaultOption) {
        nextNodeId = defaultOption.nextNodeId;
        console.log("Using DEFAULT option for multipleChoice. Next Node ID:", nextNodeId);
      }
    }

    console.log("Next Node ID:", nextNodeId);
    return nextNodeId;
  };

  const findQuestionById = (questionId: string) => {
    return questions.find((q) => q.id === questionId) || null;
  };

  const handleNodeRedirection = (nextNode: any) => {
    console.log("Handling node redirection to:", nextNode);

    if (nextNode.type === "endNode") {
      console.log("Next node is an end node, handling end node...");
      handleEndNode(nextNode);
    } else {
      console.log("Redirecting to next question:", nextNode.id);
      router.replace(`/questionnaire?question=${nextNode.id}&claim=${encodeURIComponent(claim)}`);
    }
  };

  const handleEndNode = (nextNode: any) => {
    console.log("Handling end node:", nextNode);

    if (nextNode.data.endType === "end" || nextNode.data.nextNodeId === "-1") {
      console.log("Quiz has ended. Redirecting to results.");
      toast.success("Questionnaire completed!");
      router.push(`/questionnaire/results?weight=${getCurrentWeight()}`);
    } else if (nextNode.data.endType === "redirect" && nextNode.data.redirectTab) {
      const redirectInstance = chartInstances.find(instance => instance.name === nextNode.data.redirectTab);
      if (redirectInstance) {
        console.log("Redirecting to another chart:", nextNode.data.redirectTab);
        const generatedQuestions = generateQuestionsFromAllCharts(chartInstances);

        const nextNodeInRedirect = generatedQuestions.find(q => q.id === nextNode.data.nextNodeId);
        if (nextNodeInRedirect) {
          router.replace(`/questionnaire?question=${nextNodeInRedirect.id}&claim=${encodeURIComponent(claim)}`);
        } else {
          const firstValidQuestion = generatedQuestions.find(q => q.data.label === nextNode.data.redirectTab && !q.skipRender);
          if (firstValidQuestion) {
            router.replace(`/questionnaire?question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
          } else {
            console.error("No valid question found in the redirected chart.");
            toast.error("Failed to find the starting question in the redirected chart.");
          }
        }
      } else {
        console.error("Redirect tab not found in chart instances.");
        toast.error("Redirect tab not found.");
      }
    } else {
      console.error("Invalid end node configuration.");
      toast.error("An error occurred while processing the end node.");
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
            style={{ width: `${((visualQuestions.findIndex((q) => q.id === questionId) + 1) / visualQuestions.length) * 100}%` }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              {Math.round(((visualQuestions.findIndex((q) => q.id === questionId) + 1) / visualQuestions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
      <div className="mx-8 my-4 mb-auto flex min-h-[30%] flex-col rounded-3xl bg-light-gray p-8">
        {currentQuestion ? (
          currentQuestion.type === "yesNo" ? (
            <YesNoQuestion question={currentQuestion.data.label} options={currentQuestion.data.options} onAnswer={setSelectedAnswer} />
          ) : currentQuestion.type === "singleChoice" ? (
            <SingleChoiceQuestion question={currentQuestion.data.label} options={currentQuestion.data.options} onAnswer={setSelectedAnswer} />
          ) : currentQuestion.type === "multipleChoice" ? (
            <MultipleChoiceQuestion question={currentQuestion.data.label} options={currentQuestion.data.options} onAnswer={setSelectedAnswer as any} />
          ) : (
            <div>Unknown question type: {currentQuestion.type}</div>
          )
        ) : (
          <div>No question available</div>
        )}
        <button
          type="button"
          className={`hover:bg-green-800 focus:ring-green-300 mt-auto w-40 rounded-full bg-green px-10 py-2.5 text-white focus:outline-none focus:ring-4 ${!selectedAnswer ? "opacity-50 cursor-not-allowed" : ""
            }`}
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
