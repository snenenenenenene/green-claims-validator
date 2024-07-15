"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import Sidebar from "@/components/sidebar";
import ReactFlow, { ReactFlowProvider } from "reactflow";
import useStore from "@/lib/store";
import dynamic from "next/dynamic";
import Loader from "@/components/shared/loader";

const DynamicInstancePage = dynamic(
  () => import("@/app/dashboard/[instanceId]/page"),
  {
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    ),
    ssr: false,
  },
);

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<
    (Session & { user: { role: string } }) | null
  >(null);

  const {
    chartInstances,
    currentTab,
    setCurrentTab,
    addNewTab,
    onePage,
    setOnePage,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
    addNewTab: state.addNewTab,
    onePage: state.onePage,
    setOnePage: state.setOnePage,
  }));

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData as any);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname.split("/").pop();
    setCurrentTab(currentPath || chartInstances[0].name);
  }, [setCurrentTab, chartInstances]);

  const handleAddNewTab = () => {
    const newTabName = prompt("Enter the name for the new tab:");
    if (newTabName) {
      addNewTab(newTabName);
      setCurrentTab(newTabName);
      window.history.pushState({}, "", `/dashboard/${newTabName}`);
    }
  };

  const handleTabClick = (tabName: string) => {
    setLoading(true);
    setCurrentTab(tabName);
    window.history.pushState({}, "", `/dashboard/${tabName}`);
    setTimeout(() => setLoading(false), 300); // Simulate loading delay
  };

  const onSave = () => {
    console.log("Saving schema...");
  };

  if (!session) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <section className="flex h-full w-full">
        <Sidebar onSave={onSave} onePage={onePage} setOnePage={setOnePage} />
        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full overflow-x-auto py-4 font-display">
            {chartInstances.map((chart) => (
              <button
                key={chart.name}
                onClick={() => handleTabClick(chart.name)}
                className={`flex h-full w-40 flex-col px-1 ${
                  chart.name === currentTab ? "bg-green" : ""
                } overflow-hidden text-ellipsis whitespace-nowrap rounded-xl p-2 text-xl hover:bg-[#154620]`}
              >
                {chart.name}
              </button>
            ))}
            <button
              onClick={handleAddNewTab}
              className="flex h-full w-40 flex-col rounded-xl p-2 px-1 text-xl hover:bg-[#154620]"
            >
              +
            </button>
          </div>
          {loading ? (
            <ReactFlow fitView/>
          ) : (
            <DynamicInstancePage params={{ instanceId: currentTab }} />
          )}
        </div>
      </section>
    </ReactFlowProvider>
  );
}
