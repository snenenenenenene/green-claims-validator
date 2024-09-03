"use client";
import Sidebar from '@/components/sidebar';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import Link from 'next/link';
import useStore from '@/lib/store'; // Ensure this path is correct for your store import

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex flex-grow overflow-hidden">
          <Sidebar />
          <main className="flex-grow bg-gray-100 p-4 dark:bg-gray-800 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ReactFlowProvider>
  );
}

// Header component is now defined here
function Header() {
  const { chartInstances, currentTab, setCurrentTab } = useStore((state) => ({
    chartInstances: state.chartInstances,
    currentTab: state.currentTab,
    setCurrentTab: state.setCurrentTab,
  }));

  console.log(chartInstances);

  return (
    <header className="dark:bg-gray-800 dark:text-white p-4">
      <div className="container flex items-center">
        <nav className="flex space-x-4">
          {chartInstances.map((instance) => (
            <Link
              key={instance.id}
              href={`/dashboard/${instance.id}`}
              className={`p-2 rounded border ${currentTab === instance.id ? 'border-2' : 'border-0'}`}
              onClick={() => setCurrentTab(instance.id)}
              style={{
                borderColor: instance.color,
                backgroundColor: currentTab === instance.id ? 'transparent' : instance.color,
                color: currentTab === instance.id ? instance.color : '#fff', // Text color is white when not selected
              }}
            >
              {instance.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
