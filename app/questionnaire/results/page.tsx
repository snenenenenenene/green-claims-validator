"use client";
import { useSearchParams } from 'next/navigation';
import React from "react";

export default function Results() {
  const searchParams = useSearchParams();
  const finalWeight = searchParams.get('weight');

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Results</h1>
      <p className="text-2xl">
        Final Weight: {finalWeight}
      </p>
    </div>
  );
}
