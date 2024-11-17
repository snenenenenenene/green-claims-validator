"use client";

import MultipleChoiceQuestion from "@/components/questionnaire/multipleChoiceQuestion";
import SingleChoiceQuestion from "@/components/questionnaire/singleChoiceQuestion";
import YesNoQuestion from "@/components/questionnaire/yesNoQuestion";
import { LoadingSpinner } from "@/components/ui/base";
import { useStores } from "@/hooks/useStores";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const { questionnaireStore } = useStores();
  const {
    resetCurrentWeight,
    getCurrentWeight,
    setCurrentWeight,
    initializeQuestionnaire,
    processFunctionNode,
    getNextQuestion,
    getFirstQuestion,
  } = questionnaireStore;

  const [claim, setClaim] = useState(null);
  const [allQuestions, setAllQuestions] = useState([]);
  const [visualQuestions, setVisualQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingAnswer, setProcessingAnswer] = useState(false);

  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        // Fetch claim details
        const response = await fetch(`/api/claims/${params.claimId}`);
        if (!response.ok) throw new Error('Failed to fetch claim');
        const data = await response.json();
        setClaim(data.claim);

        // Initialize questionnaire from active GCV chart
        const initialized = await initializeQuestionnaire();
        if (!initialized) {
          throw new Error('No active questionnaire found');
        }

        resetCurrentWeight();
        const firstQuestion = getFirstQuestion();
        if (!firstQuestion) {
          throw new Error("No valid first question found");
        }

        // Set the processed questions
        const questions = questionnaireStore.questions;
        const visualOnly = questionnaireStore.visualQuestions;
        setAllQuestions(questions);
        setVisualQuestions(visualOnly);

        processQuestionChain(firstQuestion);

        // Update claim status to in progress
        await fetch(`/api/claims/${params.claimId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'IN_PROGRESS',
            progress: 0
          })
        });
      } catch (error) {
        console.error('Initialization error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeQuiz();
  }, [params.claimId, initializeQuestionnaire, questionnaireStore.questions, questionnaireStore.visualQuestions]);

  const processQuestionChain = (question) => {
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
    }
  };

  const processNonVisualNode = (node) => {
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

  const handleEndNode = async (node) => {
    console.log("Handling end node:", node);

    if (node.endType === "end") {
      console.log("Quiz has ended. Redirecting to results.");

      try {
        // Update claim as completed
        await fetch(`/api/claims/${params.claimId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED',
            progress: 100
          })
        });

        toast.success("Questionnaire completed!");
        router.push(`/claims/${params.claimId}/results?weight=${getCurrentWeight()}`);
      } catch (error) {
        console.error('Error updating claim status:', error);
        toast.error("Error completing questionnaire");
      }
    } else if (node.endType === "redirect" && node.redirectTab) {
      console.log("Redirecting to another flow:", node.redirectTab);
      const redirectFlow = questionnaireStore.chartContent.flows.find(flow => flow.name === node.redirectTab);
      if (redirectFlow) {
        const startNode = redirectFlow.nodes.find(n => n.type === "startNode");
        if (startNode) {
          processQuestionChain(startNode);
        } else {
          setError("No valid start question found in the redirected flow.");
        }
      } else {
        setError("Redirect flow not found.");
      }
    } else {
      setError("Invalid end node configuration.");
    }
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !selectedAnswer || processingAnswer) return;

    setProcessingAnswer(true);
    try {
      console.log("Handling next question. Current question:", currentQuestion);
      console.log("Selected answer:", selectedAnswer);

      // Update progress
      const currentIndex = visualQuestions.findIndex(q => q.id === currentQuestion.id);
      const progress = Math.round(((currentIndex + 1) / visualQuestions.length) * 100);

      await fetch(`/api/claims/${params.claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      });

      const nextQuestion = getNextQuestion(currentQuestion.id, selectedAnswer || "DEFAULT");

      if (nextQuestion) {
        console.log("Next question:", nextQuestion);
        processQuestionChain(nextQuestion);
      } else {
        console.log("No next question found - completing questionnaire");

        // Update claim as completed
        await fetch(`/api/claims/${params.claimId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'COMPLETED',
            progress: 100
          })
        });

        router.push(`/claims/${params.claimId}/results?weight=${getCurrentWeight()}`);
      }

      setSelectedAnswer(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error("Something went wrong");
    } finally {
      setProcessingAnswer(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-slate-600 font-medium">Loading your questionnaire...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="text-red-500">{error}</div>
          <button
            onClick={() => router.push('/claims')}
            className="mt-4 text-sm text-slate-500 hover:text-slate-700"
          >
            Return to claims
          </button>
        </div>
      </div>
    );
  }

  const currentFlowQuestions = visualQuestions.filter(q => q.chartId === currentQuestion?.chartId);
  const currentQuestionIndex = currentFlowQuestions.findIndex(q => q.id === currentQuestion?.id);
  const progressPercentage = ((currentQuestionIndex + 1) / currentFlowQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Claim Title */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <h1 className="text-xl font-semibold text-slate-900">{claim?.claim}</h1>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-4 z-10 backdrop-blur-sm bg-white/80 rounded-2xl shadow-sm border border-slate-200 p-6"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-slate-600" />
                <span className="font-medium text-slate-800">
                  Current Section Progress
                </span>
              </div>
              <span className="text-sm font-medium text-slate-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="absolute h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100">
                <h2 className="text-2xl font-medium text-slate-900">
                  {currentQuestion.question}
                </h2>
              </div>

              <div className="p-8">
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
                    onAnswer={setSelectedAnswer}
                  />
                ) : null}
              </div>

              <motion.div
                className="p-8 bg-slate-50 border-t border-slate-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer || processingAnswer}
                    className={`
                      group flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-xl font-medium transition-all duration-200 
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500
                    `}
                  >
                    <span className="mr-2">Continue</span>
                    <motion.div
                      animate={{ x: selectedAnswer ? 5 : 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}