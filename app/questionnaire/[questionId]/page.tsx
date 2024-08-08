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
  const { chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab, getCurrentWeight, setCurrentWeight, resetCurrentWeight } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentQuestionnaireTab: state.currentQuestionnaireTab,
    setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
    getCurrentWeight: state.getCurrentWeight,
    setCurrentWeight: state.setCurrentWeight,
    resetCurrentWeight: state.resetCurrentWeight,
  }));

  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [onePageMode, setOnePageMode] = useState(false);
  const claim = searchParams.get('claim') || "Be a hero, fly carbon zero";

  useEffect(() => {
    if (!currentQuestionnaireTab && chartInstances.length > 0) {
      console.log("Setting current tab to:", chartInstances[0].name);
      setCurrentQuestionnaireTab(chartInstances[0].name); // Set the first instance name as the default tab
    }
  }, [chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab]);

  useEffect(() => {
    console.log("Current tab after setting default:", currentQuestionnaireTab);
    if (currentQuestionnaireTab) {
      const currentInstance = chartInstances.find(instance => instance.name === currentQuestionnaireTab);
      console.log("Current instance:", currentInstance);

      if (currentInstance) {
        setOnePageMode(currentInstance.onePageMode || false);
        const generatedQuestions = generateQuestionsFromChart(currentInstance);
        console.log("Generated questions:", generatedQuestions);
        setQuestions(generatedQuestions);
        resetCurrentWeight(); // Reset weight at the start of the quiz
        const questionIndex = generatedQuestions.findIndex(question => question.id === questionId);
        if (questionIndex !== -1) {
          setCurrentQuestionIndex(questionIndex);
          processInitialNodes(generatedQuestions[questionIndex].id);
        } else {
          processInitialNodes(generatedQuestions[0]?.id);
        }
      }
    }
  }, [chartInstances, currentQuestionnaireTab, questionId, resetCurrentWeight]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex === -1) {
      processInitialNodes(questions[0].id);
    }
  }, [questions, currentQuestionIndex]);

  useEffect(() => {
    console.log("Current weight:", getCurrentWeight());
  }, [getCurrentWeight]);

  const processInitialNodes = (nodeId: string | null) => {
    let accumulatedWeight = 1;
    while (nodeId) {
      const nextNode = questions.find(question => question.id === nodeId);
      console.log("Next node:", nextNode);

      if (nextNode && nextNode.type === "weightNode" && nextNode.weight) {
        accumulatedWeight *= nextNode.weight;
        console.log("Weight node encountered. Individual weight:", nextNode.weight, "Total accumulated weight:", accumulatedWeight);
        nodeId = nextNode.connectedNodes[0]?.target;
      } else if (nextNode && nextNode.type === "endNode") {
        if (nextNode.endType === "redirect") {
          const redirectInstance = chartInstances.find(instance => instance.name === nextNode.redirectTab);
          if (redirectInstance) {
            toast.success(`Redirected to ${nextNode.redirectTab} flow chart.`);
            setCurrentQuestionnaireTab(nextNode.redirectTab);
            const generatedQuestions = generateQuestionsFromChart(redirectInstance);
            setQuestions(generatedQuestions);
            setAnswers({});
            router.replace(`/questionnaire/${generatedQuestions[0].id}?claim=${encodeURIComponent(claim)}`);
            return;
          } else {
            toast.error("Redirect tab not found.");
            break;
          }
        } else {
          nodeId = nextNode.connectedNodes[0]?.target;
        }
      } else {
        setCurrentWeight(accumulatedWeight); // Update store state
        setCurrentQuestionIndex(questions.findIndex(q => q.id === nodeId));
        router.replace(`/questionnaire/${nodeId}?claim=${encodeURIComponent(claim)}`);
        return;
      }
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questions[currentQuestionIndex]?.id]: answer,
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion?.id];

    if (!currentQuestion) return;

    const currentInstance = chartInstances.find(instance => instance.name === currentQuestionnaireTab) as any;

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

    const processNodes = (nodeId: string | null) => {
      let accumulatedWeight = getCurrentWeight(); // Use store state for weight
      while (nodeId) {
        const nextNode = questions.find(question => question.id === nodeId);
        console.log("Next node:", nextNode);

        if (nextNode && nextNode.type === "weightNode" && nextNode.weight) {
          accumulatedWeight *= nextNode.weight;
          console.log("Weight node encountered. Individual weight:", nextNode.weight, "Total accumulated weight:", accumulatedWeight);
          nodeId = nextNode.connectedNodes[0]?.target;
        } else if (nextNode && nextNode.type === "endNode") {
          if (nextNode.endType === "redirect") {
            const redirectInstance = chartInstances.find(instance => instance.name === nextNode.redirectTab);
            if (redirectInstance) {
              toast.success(`Redirected to ${nextNode.redirectTab} flow chart.`);
              setCurrentQuestionnaireTab(nextNode.redirectTab);
              const generatedQuestions = generateQuestionsFromChart(redirectInstance);
              setQuestions(generatedQuestions);
              setAnswers({});
              router.replace(`/questionnaire/${generatedQuestions[0].id}?claim=${encodeURIComponent(claim)}`);
              return { nodeId: null, accumulatedWeight };
            } else {
              toast.error("Redirect tab not found.");
              break;
            }
          } else {
            nodeId = nextNode.connectedNodes[0]?.target;
          }
        } else {
          return { nodeId, accumulatedWeight };
        }
      }
      return { nodeId: null, accumulatedWeight };
    };

    const { nodeId, accumulatedWeight } = processNodes(nextNodeId);
    setCurrentWeight(accumulatedWeight); // Update store state

    if (nodeId) {
      const nextNode = questions.find(question => question.id === nodeId);
      if (nextNode) {
        setCurrentQuestionIndex(questions.findIndex(q => q.id === nodeId));
        router.replace(`/questionnaire/${nodeId}?claim=${encodeURIComponent(claim)}`);
      }
    } else {
      toast.success("Questionnaire completed!");
      setCurrentQuestionnaireTab(chartInstances.length > 0 ? chartInstances[0].name : ""); // Set the first tab as the default after completion
      router.push(`/questionnaire/results?weight=${accumulatedWeight}`); // Redirect to results page with weight
    }
  };

  const renderQuestion = (question: any, onAnswer: (answer: string) => void) => {
    console.log("Rendering question:", question);
    switch (question?.type) {
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
    <div className="flex h-screen w-full flex-col justify-between px-10 lg:px-20 xl:px-28 text-dark-gray">
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
              {!question.skipRender && renderQuestion(question, handleAnswer)}
            </div>
          ))
        ) : (
          <>
            {questions[currentQuestionIndex] && !questions[currentQuestionIndex].skipRender && renderQuestion(questions[currentQuestionIndex], handleAnswer)}
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
