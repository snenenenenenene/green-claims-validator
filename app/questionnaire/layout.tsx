"use client";
import { useEffect, useState, Suspense } from "react";
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import axios from "axios";
import { generateQuestionsFromChart } from "@/lib/utils";

function LayoutContent() {
  const { chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentQuestionnaireTab: state.currentQuestionnaireTab,
    setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
  }));

  const [questions, setQuestions] = useState<any[]>([]);
  const [claim, setClaim] = useState<string>("Be a hero, fly carbon zero");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!currentQuestionnaireTab && chartInstances.length > 0) {
      setCurrentQuestionnaireTab(chartInstances[0].name); // Set the first instance name as the default tab
    }
  }, [chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab]);

  useEffect(() => {
    const fetchClaim = async () => {
      const initialClaim = searchParams.get('claim') || "Be a hero, fly carbon zero";
      if (status === "authenticated" && session?.user) {
        try {
          const response = await axios.get(`/api/claim?userId=${(session.user as any).id}`);
          setClaim(response.data.claim || initialClaim);
        } catch (err) {
          console.error(err);
          setClaim(initialClaim);
          toast.error("Failed to fetch the claim");
        }
      } else {
        setClaim(initialClaim);
      }
    };

    fetchClaim();
  }, [status, session, searchParams]);

  useEffect(() => {
    if (claim !== null && currentQuestionnaireTab) {
      const currentInstance = chartInstances.find(instance => instance.name === currentQuestionnaireTab);

      if (currentInstance) {
        const generatedQuestions = generateQuestionsFromChart(currentInstance);
        setQuestions(generatedQuestions);
        if (generatedQuestions.length > 0) {
          router.replace(`/questionnaire/${generatedQuestions[0].id}?claim=${encodeURIComponent(claim)}`);
        }
      }
    }
  }, [chartInstances, currentQuestionnaireTab, claim, router]);

  return null;
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
