"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { useStores } from "@/hooks/useStores";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";

/**
 * QuestionPage handles the display and flow of the questionnaire
 * It processes questions based on their type and manages the flow between them
 * using the edges defined in the chart instances
 */
export default function QuestionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { rootStore, chartStore, questionnaireStore } = useStores();
  const {
    resetCurrentWeight,
    getCurrentWeight,
    setCurrentWeight,
    generateQuestionsFromAllCharts,
    getQuestionById,
    processFunctionNode,
    getNextQuestion,
    getFirstQuestion,
    questions,
  } = questionnaireStore;

  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [visualQuestions, setVisualQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const questionId = searchParams.get("question");
  const claim = searchParams.get("claim") || "Be a hero, fly carbon zero";

  /**
   * Initialize the questionnaire when chart instances are available
   */
  useEffect(() => {
    console.log("useEffect triggered - Initial loading");
    setIsLoading(true);
    setError(null);

    if (chartStore.chartInstances && chartStore.chartInstances.length > 0) {
      console.log("Chart instances available:", chartStore.chartInstances);
      initializeQuestionnaire();
    } else {
      console.log("No chart instances available. Waiting for chartInstances to be loaded.");
      setError("Chart data is not available. Please try again later.");
      setIsLoading(false);
    }
  }, [chartStore.chartInstances]);

  /**
   * Sets up the initial questionnaire state
   * Generates questions and starts with the first question from the start node
   */
  const initializeQuestionnaire = () => {
    try {
      const generatedQuestions = generateQuestionsFromAllCharts();
      console.log("Generated Questions:", generatedQuestions);

      setAllQuestions(generatedQuestions);

      const visualOnlyQuestions = generatedQuestions.filter(
        (q) => !["weightNode", "startNode", "endNode", "functionNode"].includes(q.type)
      );
      setVisualQuestions(visualOnlyQuestions);

      // Get the first actual question (after the start node)
      const firstQuestion = getFirstQuestion();
      if (!firstQuestion) {
        throw new Error("No valid first question found");
      }
      processQuestionChain(firstQuestion);
    } catch (error) {
      console.error("Error generating questions:", error);
      setError("An error occurred while generating questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processes a question based on its type
   * Handles non-visual nodes (weight, start, function) differently from visual questions
   */
  const processQuestionChain = (question: any) => {
    if (!question) {
      setError("No valid question found in the generated questions.");
      return;
    }

    console.log("Processing question:", question);

    if (["weightNode", "startNode", "functionNode"].includes(question.type)) {
      processNonVisualNode(question);
    } else if (question.type === "endNode") {
      handleEndNode(question);
    } else {
      setCurrentQuestion(question);
      console.log("Setting current question:", question);
      router.replace(`/questionnaire?question=${question.id}&claim=${encodeURIComponent(claim)}`);
    }
  };

  /**
   * Processes nodes that don't have a visual representation
   * Updates weights and processes function logic before moving to the next question
   */
  const processNonVisualNode = (node: any) => {
    console.log("Processing non-visual node:", node);

    if (node.type === "weightNode") {
      const weightToAdd = node.weight || 1;
      const currentWeight = getCurrentWeight();
      console.log(`Current weight before update: ${currentWeight}`);
      console.log(`Multiplying weight by ${weightToAdd}`);
      const newWeight = currentWeight * weightToAdd;
      setCurrentWeight(newWeight);
      console.log(`New weight after update: ${newWeight}`);
    } else if (node.type === "functionNode") {
      processFunctionNode(node);
    }

    const nextQuestion = getNextQuestion(node.id, "DEFAULT");
    processQuestionChain(nextQuestion);
  };

  /**
   * Handles the transition to the next question when user clicks "Volgende"
   * Uses the selectedAnswer to determine the next question based on the edges
   */
  const handleNextQuestion = () => {
    if (!currentQuestion) return;

    console.log("Handling next question. Current question:", currentQuestion);
    console.log("Selected answer:", selectedAnswer);

    const nextQuestion = getNextQuestion(currentQuestion.id, selectedAnswer || "DEFAULT");

    if (nextQuestion) {
      console.log("Next question:", nextQuestion);
      processQuestionChain(nextQuestion);
    } else {
      console.error("No next question found");
      setError("Unable to determine the next question. Please try restarting the questionnaire.");
    }

    setSelectedAnswer(null);
  };

  /**
   * Handles end nodes which can either end the questionnaire or redirect to another chart
   */
  const handleEndNode = (node: any) => {
    console.log("Handling end node:", node);

    if (node.endType === "end") {
      console.log("Quiz has ended. Redirecting to results.");
      toast.success("Questionnaire completed!");
      router.push(`/questionnaire/results?weight=${getCurrentWeight()}`);
    } else if (node.endType === "redirect" && node.redirectTab) {
      console.log("Redirecting to another chart:", node.redirectTab);
      const redirectChart = chartStore.chartInstances.find(chart => chart.name === node.redirectTab);
      if (redirectChart) {
        const startNode = redirectChart.nodes.find(n => n.type === "startNode");
        if (startNode) {
          processQuestionChain(startNode);
        } else {
          setError("No valid start question found in the redirected chart.");
        }
      } else {
        setError("Redirect chart not found.");
      }
    } else {
      setError("Invalid end node configuration.");
    }
  };

  if (isLoading) {
    return <div>Loading questionnaire...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!currentQuestion) {
    return <div>No question available. Please try restarting the questionnaire.</div>;
  }

  return (
    <div className="flex h-screen w-full flex-col justify-between px-10 lg:px-20 xl:px-28 text-dark-gray">
      <div className="my-6 flex justify-center font-roboto text-3xl">
        <p>{claim}</p>
      </div>
      <div className="w-full px-8 pb-4">
        <div className="relative h-12 w-full rounded-full bg-gray-200 p-2 dark:bg-gray-700">
          <div
            className="h-full rounded-full bg-green transition-all duration-500 ease-in-out dark:bg-green"
            style={{ width: `${((visualQuestions.findIndex((q) => q.id === currentQuestion.id) + 1) / visualQuestions.length) * 100}%` }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white">
              {Math.round(((visualQuestions.findIndex((q) => q.id === currentQuestion.id) + 1) / visualQuestions.length) * 100)}%
            </span>
          </div>
        </div>
      </div>
      <div className="mx-8 my-4 mb-auto flex min-h-[30%] flex-col rounded-3xl bg-light-gray p-8">
        {currentQuestion.type === "yesNo" ? (
          <YesNoQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            onAnswer={setSelectedAnswer}
          />
        ) : currentQuestion.type === "singleChoice" ? (
          <SingleChoiceQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            onAnswer={setSelectedAnswer}
          />
        ) : currentQuestion.type === "multipleChoice" ? (
          <MultipleChoiceQuestion
            question={currentQuestion.question}
            options={currentQuestion.options}
            onAnswer={setSelectedAnswer as any}
          />
        ) : (
          <div>Unknown question type: {currentQuestion.type}</div>
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