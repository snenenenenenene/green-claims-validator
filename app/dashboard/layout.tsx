"use client";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { Session } from "next-auth";
import { chartInstances } from "@/app/data/charts";
import Link from "next/link";
import Sidebar from "@/components/dashboard/sidebar";
import { ReactFlowProvider } from "reactflow";
import { useRouter } from "next/router";

export default function Dashboard({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<
    (Session & { user: { role: string } }) | null
  >(null);

  useEffect(() => {
    const fetchSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData as any);
    };
    fetchSession();
  }, []);

  // useEffect(() => {
  //   if (session && session?.user?.role !== "admin") {
  //   }
  // }, [session, router]);

  if (!session) {
    return <p>Loading...</p>;
  }

  return (
    <ReactFlowProvider>
      <section className="flex h-full w-full">
        <div className="flex h-full w-full flex-col">
          <div className="flex h-20 w-full py-4 font-display">
            {chartInstances.map((chart) => (
              <Link
                href={`/dashboard/${chart.name}`}
                key={chart.name}
                className="flex h-full w-32 flex-col px-1"
              >
                <button className="rounded-xl p-2 text-2xl hover:bg-[#154620]">
                  {chart.name}
                </button>
              </Link>
            ))}
          </div>
          {children}
        </div>
        <Sidebar />
      </section>
    </ReactFlowProvider>
  );
}
