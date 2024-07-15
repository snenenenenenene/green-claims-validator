"use client";
import { Suspense } from "react";
import { Environment, SoftShadows } from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Model } from "@/components/home/model";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

export default async function Home() {
  return (
    <div className="relative flex w-full flex-col self-start px-20">
      <section className="flex h-screen w-full">
        <div className="items-between flex w-1/2 flex-col justify-center py-40">
          <span className="flex flex-col">
            <h1 className="font-roboto text-7xl text-black">
              Green Claims Validator
            </h1>

            <p className="mt-2 font-poppins text-3xl">
              The first user friendly app that empowers companies to verify the
              authenticity of their green claims.
            </p>
          </span>
          <Link href="/questionaire" className="mt-12">
            <button className=" my-auto flex items-center justify-center rounded-md bg-green px-8 py-4 font-roboto text-3xl text-black transition-all duration-200 hover:scale-105">
              Get Started
              <ArrowRightIcon className="ml-4 text-6xl" />
            </button>
          </Link>
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
