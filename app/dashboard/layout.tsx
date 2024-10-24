"use client";
import React from 'react';
import Sidebar from '@/components/sidebar';
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-grow bg-gray-100 p-4 dark:bg-gray-800 overflow-auto">
          {children}
        </main>
      </div>
    </ReactFlowProvider>
  );
}