"use client";

import { Toaster } from "react-hot-toast";

export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex relative h-full w-full flex-col overflow-hidden justify-between text-dark-gray">
      <Toaster />
      <div className="h-screen w-full flex-col justify-between absolute top-0 left-0">
        {children}
      </div>
    </div>
  );
}