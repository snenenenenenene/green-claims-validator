"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import { Coins, Plus, FileText, ChevronRight, LayoutGrid } from "lucide-react";
import { useStores } from "@/hooks/useStores";
import { motion } from "framer-motion";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);
  const pathname = usePathname();

  const { chartStore, utilityStore } = useStores();
  const { chartInstances, setChartInstances } = chartStore;
  const { currentTab, setCurrentTab } = utilityStore;
  const addNewTab = chartStore.addNewTab;

  const [isLoading, setIsLoading] = useState(true);

  const isDashboardRoute = pathname.startsWith("/dashboard");

  useEffect(() => {
    const loadChartInstances = async () => {
      try {
        const response = await fetch('/api/load-chart');
        if (response.ok) {
          const data = await response.json();
          if (data.content) {
            const parsedContent = JSON.parse(data.content);
            setChartInstances(parsedContent);
            if (parsedContent.length > 0 && !currentTab) {
              setCurrentTab(parsedContent[0].id);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load chart instances:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChartInstances();
  }, [setChartInstances, setCurrentTab, currentTab]);

  const handleAddNewTab = () => {
    const newTabName = `New Tab ${chartInstances.length + 1}`;
    addNewTab(newTabName);
  };

  if (isLoading) {
    return (
      <div className="fixed top-0 w-full h-16 bg-white/50 backdrop-blur-xl z-30">
        <div className="mx-5 flex h-16 w-full items-center justify-between">
          <div className="animate-pulse bg-gray-200 h-8 w-32 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <SignInModal />
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 flex w-full justify-center ${scrolled
            ? "bg-white/50 backdrop-blur-xl border-b border-gray-200/50"
            : "bg-white/0"
          } z-30 transition-all duration-300`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Green Claims Validator logo"
                width="100"
                height="100"
                className="rounded-sm"
              />
            </Link>

            {session && isDashboardRoute && (
  <div className="hidden md:flex items-center gap-3">
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 shadow-sm">
      <LayoutGrid className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600 font-medium">Charts</span>
    </div>
    <div className="h-6 w-px bg-gray-200" />
    <div className="flex items-center gap-2">
      {chartInstances.map((instance) => (
        <motion.div
          key={instance.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={`/dashboard/${instance.id}`}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium 
              transition-all duration-300 ease-in-out
              shadow-sm hover:shadow-md
              ${currentTab === instance.id 
                ? "ring-2 ring-offset-2" 
                : "hover:ring-2 hover:ring-offset-1"
              }
            `}
            onClick={() => {
              if (currentTab !== instance.id) {
                setCurrentTab(instance.id);
              }
            }}
            style={{
              backgroundColor: instance.color,
              color: "#fff",
              ringColor: instance.color
            }}
          >
            {instance.name}
          </Link>
        </motion.div>
      ))}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddNewTab}
        className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
      >
        <Plus size={16} className="text-gray-600" />
      </motion.button>
    </div>
  </div>
)}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/payments"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {(session.user as any).credits}
                    </span>
                    <Coins className="h-4 w-4 text-gray-600" />
                  </Link>
                </motion.div>
                <div className="h-6 w-px bg-gray-200" />
                <UserDropdown session={session} />
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSignInModal(true)}
                className="flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Log in
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  return color.replace(/^#/, '').match(/.{2}/g)?.map(hex => {
    const value = Math.min(255, Math.max(0, parseInt(hex, 16) + amount));
    return value.toString(16).padStart(2, '0');
  }).join('') || color;
}