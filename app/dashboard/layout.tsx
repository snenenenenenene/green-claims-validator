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
    deleteTab, // Assuming you have a deleteTab function in your store
    onePage,
    setOnePage,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
    addNewTab: state.addNewTab,
    deleteTab: state.deleteTab,
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
    setCurrentTab(currentPath || chartInstances[0]?.name);
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

  const handleDelete = () => {
    if (currentTab) {
      if (confirm(`Are you sure you want to delete the tab ${currentTab}?`)) {
        deleteTab(currentTab);
        setCurrentTab(chartInstances[0]?.name || null); // Set to first tab or null if no tabs are left
        window.history.pushState(
          {},
          "",
          `/dashboard/${chartInstances[0]?.name}`,
        );
        alert(`Tab ${currentTab} has been deleted.`);
      }
    } else {
      alert("No tab selected to delete.");
    }
  };

  const onSave = () => {
    console.log(`boop`);
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
        <Sidebar
          onSave={onSave}
          onePage={onePage}
          setOnePage={setOnePage}
          onDelete={handleDelete}
        />
        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full gap-2 overflow-x-auto py-4 font-display">
            {chartInstances.map((chart) => (
              <button
                key={chart.name}
                onClick={() => handleTabClick(chart.name)}
                className={`flex h-full items-center justify-center px-4 ${
                  chart.name === currentTab ? "bg-gray-400" : "bg-white"
                } overflow-hidden text-ellipsis whitespace-nowrap rounded-xl p-2 text-xl hover:bg-gray-200`}
              >
                {chart.name}
              </button>
            ))}
            <button
              onClick={handleAddNewTab}
              className="flex h-full items-center justify-center rounded-xl p-2 px-4 text-xl hover:bg-gray-200"
            >
              +
            </button>
          </div>
          {loading ? (
            <ReactFlow fitView />
          ) : (
            <DynamicInstancePage params={{ instanceId: currentTab }} />
          )}
        </div>
      </section>
    </ReactFlowProvider>
  );
}
