"use client";

import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Environment, OrbitControls, SoftShadows } from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Forest } from "@/components/models/forest";

export default function QuestionnaireLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex relative h-full w-full flex-col overflow-hidden justify-between text-dark-gray">
      <Canvas camera={{ near: 2, far: 50000, fov: 35, position: [0, 0, 0] }} className="absolute top-0 left-0 flex h-full w-full">
        <ambientLight intensity={1} />
        <OrbitControls target={[10, 2, 0]} />
        <pointLight position={[10, 10, 10]} />
        <SoftShadows samples={100} />
        <Environment preset="sunset" />
        <Suspense fallback={null}>
          <Forest scale={0.1} rotation={[0, 0, 0]} position={[0, 0, 0]} />
        </Suspense>
      </Canvas>
      <Toaster />
      <div className="h-screen w-full flex-col justify-between absolute top-0 left-0">
        {children}
      </div>
    </div>
  );
}