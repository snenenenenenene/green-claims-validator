"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import React from "react";
import { Environment, SoftShadows } from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Model as Forest } from "@/components/models/forest";

export default function Results() {
  const searchParams = useSearchParams();
  const finalWeight = searchParams.get('weight');

  return (
    <div className="flex relative flex-col items-center justify-center overflow-hidden h-screen">
      <div className="w-screen h-screen top-0 left-0 absolute z-10 flex overflow-x-scroll justify-center items-center">
        <span className="flex flex-col text-black dark:text-white">
          <h1 className="text-4xl font-bold mb-4">Results</h1>
          <p className="text-2xl">
            Final Weight: {finalWeight}
          </p>
        </span>
      </div>
    </div>
  );
}
