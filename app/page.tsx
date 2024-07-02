"use client";
import Card from "@/components/home/card";
import { DEPLOY_URL } from "@/lib/constants";
import { Github, Twitter } from "@/components/shared/icons";
import WebVitals from "@/components/home/web-vitals";
import Image from "next/image";
import { nFormatter } from "@/lib/utils";
import { Suspense } from "react";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  SoftShadows,
} from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Model } from "@/components/home/model";

export default async function Home() {
  return (
    <div className="relative flex h-full w-full flex-col self-start">
      <div className="absolute -bottom-[100%] -left-20 -z-10 aspect-square w-screen rounded-t-full bg-[#154620]" />
      <section className="flex h-full w-full">
        <div className="flex w-1/2 flex-col">
          <span className="flex h-full  items-center justify-center">
            <p className="text-6xl text-yellow">
              <b className=" font-bretish">Lutrify</b>
              &nbsp; is a tool for companies to validate their green claims.
            </p>
          </span>
          <span>
            <p>
              We provide a platform for companies to validate their green claims
            </p>
          </span>
        </div>
        <span className="flex w-1/2">
          <Canvas className="flex h-full w-full">
            {/* <OrbitControls enablePan={false} enableZoom={false} /> */}
            {/* <PerspectiveCamera makeDefault /> */}
            <ambientLight intensity={0.1} />
            {/* <pointLight position={[10, 10, 10]} /> */}
            <SoftShadows samples={100} />
            {/* <Environment preset="sunset" /> */}

            <Suspense fallback={null}>
              <Model scale={1} position={[0, -1, 0]} />
            </Suspense>
          </Canvas>
        </span>
      </section>
    </div>
  );
}
