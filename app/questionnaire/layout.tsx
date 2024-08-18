"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { Toaster, toast } from "react-hot-toast";
import useStore from "@/lib/store";
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from "next-auth/react";
import axios from "axios";

function LayoutContent() {
  const { chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentQuestionnaireTab: state.currentQuestionnaireTab,
    setCurrentQuestionnaireTab: state.setCurrentQuestionnaireTab,
  }));

  const [claim, setClaim] = useState<string>("Be a hero, fly carbon zero");
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasInitialized = useRef(false); // To prevent infinite loop

  // Helper function to remove publishedVersions from chartInstances
  const sanitizeChartInstances = (chartInstances: any[]) => {
    return chartInstances.map(({ publishedVersions, ...rest }) => rest);
  };

  useEffect(() => {
    console.log("LayoutContent useEffect triggered");

    // Sanitize chartInstances by removing publishedVersions
    const sanitizedChartInstances = sanitizeChartInstances(chartInstances);

    console.log("Current Questionnaire Tab:", currentQuestionnaireTab);
    console.log("Chart Instances:", sanitizedChartInstances);

    // Ensure chart instances are loaded
    if (sanitizedChartInstances.length === 0) {
      console.log("Chart instances not loaded yet.");
      return;
    }

    const chart = searchParams.get("chart");
    const question = searchParams.get("question");

    if (!hasInitialized.current) {
      const firstChart = sanitizedChartInstances[0];
      console.log("First Chart Name:", firstChart.name);

      if (!chart || !question) {
        console.log("No chart or question in the URL, setting default chart and question.");
        setCurrentQuestionnaireTab(firstChart.name);

        const firstValidQuestion = firstChart.initialNodes.find(node => !node.skipRender);
        if (firstValidQuestion) {
          console.log("Redirecting to the first valid question in the first chart.");
          router.replace(`/questionnaire?chart=${firstChart.name}&question=${firstValidQuestion.id}&claim=${encodeURIComponent(claim)}`);
        } else {
          console.error("No valid question found in the first chart.");
        }
      } else if (currentQuestionnaireTab !== firstChart.name) {
        console.log("Setting default questionnaire tab to:", firstChart.name);
        setCurrentQuestionnaireTab(firstChart.name);
      }

      hasInitialized.current = true;
    }
  }, [chartInstances, currentQuestionnaireTab, setCurrentQuestionnaireTab, router, claim, searchParams]);

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

  return null; // No direct UI from layout; it's all handled in the page
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
