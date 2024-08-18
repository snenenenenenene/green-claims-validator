"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { generateQuestionsFromAllCharts } from "@/lib/utils";

function LayoutContent() {
  const { chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentQuestionnaireTab: state.currentQuestionnaireTab,
    setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
  }));

  const [claim, setClaim] = useState<string>("Be a hero, fly carbon zero");
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasInitialized = useRef(false); // To prevent infinite loop

  useEffect(() => {
    console.log("LayoutContent useEffect triggered - Initial loading");

    const allQuestions = generateQuestionsFromAllCharts(chartInstances);
    console.log("All generated questions:", allQuestions);

    const chart = searchParams.get("chart");
    const questionId = searchParams.get("question");

    if (!hasInitialized.current) {
      const currentInstance = chartInstances.find((ci) => ci.name === chart);
      if (!currentInstance) {
        console.error("Chart not found:", chart);
        return;
      }

      setCurrentQuestionnaireTab(currentInstance.name);

      const generatedQuestions = allQuestions.filter(q => q.previousQuestionIds.includes(questionId) || q.id === questionId);
      console.log("Generated Questions:", generatedQuestions);

      const foundQuestion = generatedQuestions.find(q => q.id === questionId);

      if (foundQuestion) {
        setCurrentQuestion(foundQuestion);
      } else {
        console.error("Question not found, redirecting to the first valid question.");
        const firstValidQuestion = generatedQuestions[0];
        router.replace(`/questionnaire?chart=${chart}&question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
      }

      hasInitialized.current = true;
    }
  }, [chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab, router, claim, searchParams]);

  useEffect(() => {
    console.log("ASDASJBDIABOASBDSA")
    if (currentQuestion?.type === "weightNode" || currentQuestion?.skipRender) {
      const nextNodeId = currentQuestion.options[0]?.nextQuestionId;
      console.log(`Skipping ${currentQuestion.type} and moving to next question with ID: ${nextNodeId}`);
      router.replace(`/questionnaire?chart=${searchParams.get("chart")}&question=${nextNodeId}&claim=${encodeURIComponent(claim)}`);
    } else if (currentQuestion?.type === "endNode" && currentQuestion?.endType === "redirect") {
      console.log("IS THIS DOING ANYTHING")
      const nextNodeId = currentQuestion.options[0]?.nextQuestionId;
      console.log(`Redirecting to chart ${currentQuestion.redirectTab} and start node with ID: ${nextNodeId}`);
      router.replace(`/questionnaire?chart=${currentQuestion.redirectTab}&question=${nextNodeId}&claim=${encodeURIComponent(claim)}`);
    }
  }, [currentQuestion, router, searchParams, claim]);

  const handleNext = () => {
    if (currentQuestion) {
      const nextNodeId = currentQuestion.options?.[0]?.nextQuestionId || null;

      console.log("Handling next question. Current question:", currentQuestion);
      console.log("Next Node ID:", nextNodeId);

      if (nextNodeId) {
        router.push(`/questionnaire?chart=${searchParams.get("chart")}&question=${nextNodeId}&claim=${encodeURIComponent(claim)}`);
      } else {
        console.error("No next node ID found");
      }
    }
  };

  useEffect(() => {
    const fetchClaim = async () => {
      const initialClaim = searchParams.get('claim') || "Be a hero, fly carbon zero";
      if (status === "authenticated" && session?.user) {
        try {
          const response = await axios.get(`/api/claim?userId=${(session.user as any).id}`);
          setClaim(response.data.claim || initialClaim);
        } catch (err) {
          console.error("Failed to fetch the claim", err);
          setClaim(initialClaim);
          toast.error("Failed to fetch the claim");
        }
      } else {
        setClaim(initialClaim);
      }
    };

    fetchClaim();
  }, [status, session, searchParams]);

  if (!currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{currentQuestion.question}</h1>
      {currentQuestion.options && currentQuestion.options.map((option: any, index: number) => (
        <button key={index} onClick={handleNext}>
          {option.label}
        </button>
      ))}
      <button onClick={handleNext}>Volgende</button>
    </div>
  );
}

export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col justify-between px-10 md:px-20 lg:px-24 xl:px-40 text-dark-gray">
      <Suspense fallback={<div>Loading...</div>}>
        <LayoutContent />
      </Suspense>
      <Toaster />
      {children}
    </div>
  );
}
