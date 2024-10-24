"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import { Coins, Plus } from "lucide-react";
import { useStores } from "@/hooks/useStores";

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
    return <div>Loading...</div>; // Or any loading indicator you prefer
  }

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 flex w-full justify-center ${scrolled
            ? "bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl"
            : "bg-white/0 dark:bg-gray-900/0"
          } z-30 transition-all`}
      >
        <div className="mx-5 flex h-24 w-full items-center justify-between">
          <Link href="/" className="flex items-center font-roboto text-4xl">
            <Image
              src="/logo.png"
              alt="Green Claims Validator logo"
              width="120"
              height="120"
              className="mr-0 rounded-sm"
            />
          </Link>
          {isDashboardRoute && (
            <div className="flex-grow mx-4">
              <nav className="flex flex-wrap gap-2 items-center">
                {chartInstances.map((instance) => (
                  <Link
                    key={instance.id}
                    href={`/dashboard/${instance.id}`}
                    className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out ${currentTab === instance.id
                        ? "ring-2 ring-offset-2 font-semibold"
                        : "hover:ring-2 hover:ring-offset-2"
                      }`}
                    onClick={() => {
                      if (currentTab !== instance.id) {
                        setCurrentTab(instance.id);
                      }
                    }}
                    style={{
                      backgroundColor: instance.color,
                      color: "#fff",
                      ringColor: instance.color,
                      ringOffsetColor: "white",
                    }}
                  >
                    {instance.name}
                  </Link>
                ))}
                <button
                  onClick={handleAddNewTab}
                  className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 ease-in-out flex items-center justify-center"
                >
                  <Plus size={20} className="text-black dark:text-white" />
                </button>
              </nav>
            </div>
          )}
          <section className="flex items-center gap-4 text-lg font-medium">
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href={"/payments"} className="flex btn font-medium">
                    <span className="text-xl font-roboto">
                      {(session.user as any).credits}
                    </span>
                    <Coins className="text-xl" />
                  </Link>
                  <UserDropdown session={session} />
                </>
              ) : (
                <button
                  className="rounded-full p-1.5 px-8 py-4 font-roboto text-xl text-gray-400 transition-all duration-200 hover:text-black dark:hover:text-white hover:underline"
                  onClick={() => setShowSignInModal(true)}
                >
                  Log in
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}