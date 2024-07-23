"use client";
import { Suspense } from "react";
import { Environment, SoftShadows } from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Model } from "@/components/home/model";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="relative flex w-full flex-col self-start px-20">
      <section className="flex h-screen w-full">
        <div className="items-between flex w-1/2 flex-col justify-center py-40">
          <span className="flex flex-col">
            <h1 className="font-roboto text-7xl text-black">
              Green Claims Validator
            </h1>

            <p className="mt-2 font-poppins text-3xl">
              The first user-friendly app that empowers companies to verify the
              authenticity of their green claims.
            </p>
          </span>
          <div className="relative mt-12 flex items-center font-poppins">
            <input
              type="text"
              placeholder="Enter your claim..."
              className="w-full rounded-full border border-gray-300 px-6 py-6 text-lg text-gray-700 outline-green focus:border-green focus:outline-none focus:ring-2 focus:ring-green"
            />
            <Link href="/questionnaire" className="absolute right-2">
              <button className="flex items-center justify-center rounded-full bg-green px-6 py-4 text-lg text-white transition-all duration-200 hover:scale-105">
                Try it for free
                <ArrowRightIcon className="ml-2 text-2xl" />
              </button>
            </Link>
          </div>
        </div>
        <span className="flex w-1/2">
          <Canvas className="flex h-full w-full">
            <ambientLight intensity={1} />
            <pointLight position={[10, 10, 10]} />
            <SoftShadows samples={100} />
            <Environment preset="sunset" />

            <Suspense fallback={null}>
              <Model scale={3} position={[0, 0, 0]} />
            </Suspense>
          </Canvas>
        </span>
      </section>
    </div>
  );
}
