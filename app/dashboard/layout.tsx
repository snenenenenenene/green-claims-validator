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
    deleteTab,
    setOnePage,
    onePage,
  } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentDashboardTab: state.currentDashboardTab,
    setCurrentDashboardTab: state.setCurrentDashboardTab,
    addNewTab: state.addNewTab,
    deleteTab: state.deleteTab,
    onePage: state.onePage,
    setOnePage: state.setOnePage,
  }));

  const [loading, setLoading] = useState(false);
  const [newColor, setNewColor] = useState("#000");

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData as any);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname.split("/").pop();
    setCurrentDashboardTab(currentPath || chartInstances[0]?.name);
  }, [setCurrentDashboardTab, chartInstances]);

  const handleAddNewTab = () => {
    const newTabName = prompt("Enter the name for the new tab:");
    if (newTabName) {
      addNewTab(newTabName);
      setCurrentDashboardTab(newTabName);
      window.history.pushState({}, "", `/dashboard/${newTabName}`);
    }
  };

  const handleTabClick = (tabName: string) => {
    setLoading(true);
    setCurrentDashboardTab(tabName);
    window.history.pushState({}, "", `/dashboard/${tabName}`);
    setTimeout(() => setLoading(false), 300); // Simulate loading delay
  };

  const handleDelete = () => {
    if (currentDashboardTab) {
      if (confirm(`Are you sure you want to delete the tab ${currentDashboardTab}?`)) {
        deleteTab(currentDashboardTab);
        setCurrentDashboardTab(chartInstances[0]?.name);
        window.history.pushState(
          {},
          "",
          `/dashboard/${chartInstances[0]?.name}`,
        );
        alert(`Tab ${currentDashboardTab} has been deleted.`);
      }
    } else {
      alert("No tab selected to delete.");
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(event.target.value);
  };

  useEffect(() => {
    if (pathname.endsWith("/dashboard")) {
      router.replace(`/dashboard/${encodeURIComponent(chartInstances[0].name)}`);
    } else {
      const currentPath = decodeURIComponent(pathname.split("/").pop() || "");
      setCurrentDashboardTab(currentPath);
    }
  }, [setCurrentDashboardTab, chartInstances, pathname, router]);

  const handleSaveSettings = () => {
    setOnePage(onePage);
    (document.getElementById("settings_modal") as any).close();
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
        <Sidebar onSave={onSave} onDelete={handleDelete} />
        <div className="flex h-full w-full flex-col">
          <div className="font-display flex h-20 w-full gap-2 overflow-x-auto py-4">
            {chartInstances.map((chart) => {
              const tabColor =
                chart.color && chart.color !== "#000"
                  ? chart.color
                  : "#000";
              const textColor = getContrastingTextColor(tabColor);
              return (
                <button
                  key={chart.name}
                  onClick={() => handleTabClick(chart.name)}
                  style={{
                    backgroundColor:
                      chart.name === currentDashboardTab ? "#ffffff" : tabColor,
                    borderColor:
                      chart.name === currentDashboardTab ? tabColor : "transparent",
                    color: chart.name === currentDashboardTab ? tabColor : textColor,
                  }}
                  className={`flex h-full items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded-xl p-2 px-4 text-xl hover:bg-gray-200 ${chart.name === currentDashboardTab ? "border-2" : ""
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

      <dialog id="settings_modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Diagram Settings</h3>
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
