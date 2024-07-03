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
    <div className="relative flex w-full flex-col self-start">
      <div className="absolute -bottom-[100%] -left-20 -z-10 aspect-square w-screen rounded-t-full bg-[#154620]" />
      <section className="flex h-screen w-full">
        <div className="flex w-1/2 flex-col justify-center">
          <span className="flex items-center justify-center">
            <p className="text-6xl text-yellow">
              <b className=" font-bretish">Lutrify</b>
              &nbsp; is a tool for companies to validate their green claims.
            </p>
          </span>
          <span className="mt-4 font-display text-3xl">
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
            <pointLight position={[10, 10, 10]} />
            <SoftShadows samples={100} />
            {/* <Environment preset="sunset" /> */}

            <Suspense fallback={null}>
              <Model scale={1} position={[0, -1, 0]} />
            </Suspense>
          </Canvas>
        </span>
      </section>
      <section className="flex h-screen w-full flex-col">
        <h2 className="font-bretish text-5xl text-yellow">Why Lutrify?</h2>
        <span className="flex w-[60%] flex-col gap-4 font-display text-2xl">
          <p>
            The mission of Lutrify is to verify the sustainability of products
            and services, ensuring that consumers and businesses alike can trust
            the ecological integrity of their choices. The name Lutrify is
            derived from &quot;Lutris&quot;, the Latin word for river otter, and
            &quot;Verify&quot;, reflecting our commitment to authenticating
            environmental claims. Just as the river otter serves as an indicator
            species in its ecosystem, Lutrify aims to be the benchmark for
            assessing and indicating the sustainability of various services and
            products.
          </p>
          <p>
            River otters are known for their playful nature and their crucial
            role in maintaining healthy waterways. Their presence is a sign of a
            balanced and thriving environment. Similarly, Lutrify endeavors to
            bring transparency and balance to the market by verifying
            environmental claims and promoting sustainable practices. By
            leveraging the symbolism of the river otter, Lutrify embodies the
            values of vigilance, playfulness, and ecological health.
          </p>
          <p>
            In cooperation with the new European Greenwashing legislation, we
            aim to provide an intuitive and easy-to-use platform equipped with a
            comprehensive questionnaire. This tool is designed to meticulously
            rate and verify the sustainability claims made by businesses. By
            doing so, Lutrify helps to protect consumers from misleading
            information and supports companies in demonstrating their genuine
            commitment to environmental stewardship.
          </p>
          <p>
            Our platform not only highlights the sustainable efforts of
            businesses but also fosters a community of conscious consumers who
            are dedicated to making informed choices. With Lutrify,
            sustainability is more than just a buzzword; it&apos;s a verified
            reality, much like the thriving habitats of the river otters we
            admire and protect.
          </p>
        </span>
      </section>
    </div>
  );
}
