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

  const {
    chartInstances,
    currentTab,
    setCurrentTab,
    addNewTab,
    deleteTab,
    setOnePage,
    currentTabColor,
    onePage,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
    addNewTab: state.addNewTab,
    deleteTab: state.deleteTab,
    onePage: state.onePage,
    setOnePage: state.setOnePage,
    currentTabColor: state.currentTabColor,
  }));

  const [loading, setLoading] = useState(false);
  const [newColor, setNewColor] = useState(currentTabColor);

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

  useEffect(() => {
    setNewColor(currentTabColor);
  }, [currentTabColor]);

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

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(event.target.value);
  };

  const handleSaveSettings = () => {
    setCurrentTabColor(newColor);
    setOnePage(onePage);
    document.getElementById("settings_modal")?.close();
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
        <Sidebar onSave={onSave} onDelete={handleDelete} />
        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full gap-2 overflow-x-auto py-4 font-display">
            {chartInstances.map((chart) => {
              const tabColor =
                chart.color && chart.color !== "#ffffff"
                  ? chart.color
                  : currentTabColor;
              const textColor = getContrastingTextColor(tabColor);
              return (
                <button
                  key={chart.name}
                  onClick={() => handleTabClick(chart.name)}
                  style={{
                    backgroundColor:
                      chart.name === currentTab ? "#ffffff" : tabColor,
                    borderColor:
                      chart.name === currentTab ? tabColor : "transparent",
                    color: chart.name === currentTab ? tabColor : textColor,
                  }}
                  className={`flex h-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-xl p-2 px-4 text-xl hover:bg-gray-200 ${
                    chart.name === currentTab ? "border-2" : ""
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
            <DynamicInstancePage params={{ instanceId: currentTab }} />
          )}
        </div>
      </section>

      <dialog id="settings_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Diagram Settings</h3>
          <label className="mb-2 block">
            Tab Color:
            <input
              type="color"
              value={newColor}
              onChange={handleColorChange}
              className="ml-2"
            />
          </label>
          <div className="mt-4 flex items-center">
            <label className="mr-2">One Page Mode:</label>
            <input
              type="checkbox"
              checked={onePage}
              onChange={(e) => setOnePage(e.target.checked)}
              className="form-checkbox"
            />
          </div>
          <div className="mt-4">
            <button
              className="bg-green-500 mr-2 rounded p-2 text-white"
              onClick={handleSaveSettings}
            >
              Save
            </button>
            <button
              className="rounded bg-red-500 p-2 text-white"
              onClick={handleDelete}
            >
              Delete Tab
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Close</button>
        </form>
      </dialog>
    </ReactFlowProvider>
  );
}
