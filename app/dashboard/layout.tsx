"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import Sidebar from "@/components/sidebar";
import ReactFlow, { ReactFlowProvider } from "reactflow";
import useStore from "@/lib/store";
import dynamic from "next/dynamic";
import Loader from "@/components/shared/loader";
import { Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

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

const getContrastingTextColor = (hexColor: string) => {
  const color = hexColor.replace("#", "");
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? "#000000" : "#FFFFFF";
};

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<
    (Session & { user: { role: string } }) | null
  >(null);

  const router = useRouter();
  const pathname = usePathname();

  const {
    chartInstances,
    currentDashboardTab,
    setCurrentDashboardTab,
    addNewTab,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentDashboardTab: state.currentDashboardTab,
    setCurrentDashboardTab: state.setCurrentDashboardTab,
    addNewTab: state.addNewTab,
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
    if (chartInstances.length === 0) {
      const defaultId = uuidv4();
      router.replace(`/dashboard/${defaultId}`);
    } else {
      const currentPath = decodeURIComponent(pathname.split("/").pop() || "");
      const instance = chartInstances.find((instance) => instance.id === currentPath);
      if (!instance) {
        router.replace(`/dashboard/${encodeURIComponent(chartInstances[0].id)}`);
      } else {
        setCurrentDashboardTab(currentPath);
      }
    }
  }, [setCurrentDashboardTab, chartInstances, pathname, router]);

  const handleAddNewTab = () => {
    const newTabName = prompt("Enter the name for the new tab:");
    if (newTabName) {
      addNewTab(newTabName);
      const newTab = chartInstances.find(tab => tab.name === newTabName);
      if (newTab) {
        setCurrentDashboardTab(newTab.id);
        window.history.pushState({}, "", `/dashboard/${newTab.id}`);
      }
    }
  };

  const handleTabClick = (tabId: string) => {
    setLoading(true);
    setCurrentDashboardTab(tabId);
    window.history.pushState({}, "", `/dashboard/${tabId}`);
    setTimeout(() => setLoading(false), 300); // Simulate loading delay
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
        <Sidebar />
        <div className="flex h-full w-full flex-col">
          <div className="font-display flex h-20 w-full gap-2 overflow-x-auto px-2 py-4">
            {chartInstances.map((chart) => {
              const tabColor =
                chart.color && chart.color !== "#000"
                  ? chart.color
                  : "#000";
              const textColor = getContrastingTextColor(tabColor);
              return (
                <button
                  key={chart.id}
                  onClick={() => handleTabClick(chart.id)}
                  style={{
                    backgroundColor:
                      chart.id === currentDashboardTab ? "#ffffff" : tabColor,
                    borderColor:
                      chart.id === currentDashboardTab ? tabColor : "transparent",
                    color: chart.id === currentDashboardTab ? tabColor : textColor,
                  }}
                  className={`flex h-full hover:scale-105 transition-all duration-200 items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-xl p-2 px-4 text-xl hover:bg-gray-200 ${chart.id === currentDashboardTab ? "border-2" : ""
                    }`}
                >
                  {chart.name}
                </button>
              );
            })}
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
            <DynamicInstancePage params={{ instanceId: currentDashboardTab }} />
          )}
        </div>
      </section>

      {/* {showDeleteConfirmation && (
        <dialog open className="modal">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Confirm Delete</h3>
            <p>Are you sure you want to delete the tab &quot;{currentDashboardTab}&quot;?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button className="btn" onClick={() => setShowDeleteConfirmation(false)}>
                Cancel
              </button>
              <button className="btn btn-error" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </dialog>
      )} */}
    </ReactFlowProvider>
  );
}
