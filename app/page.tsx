"use client";
import { useState, Suspense } from "react";
import { useRouter } from 'next/navigation';
import { Environment, SoftShadows } from "@react-three/drei";
import { Canvas } from "react-three-fiber";
import { Model } from "@/components/home/model";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function Home() {
  const { data: session, update } = useSession(); // useSession to manage session data
  const [claim, setClaim] = useState("");
  const router = useRouter();
  const [existingClaim, setExistingClaim] = useState("");

  const handleClaimChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClaim(e.target.value);
  };

  const handleGetStartedClick = async () => {
    if (session?.user) {
      try {
        const response = await axios.get(`/api/claim?userId=${(session.user as any).id}`);
        if (response.data.claim) {
          setExistingClaim(response.data.claim);
          (document.getElementById("existingClaimModal") as HTMLDialogElement).showModal();
        } else {
          await createClaim();
        }
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while fetching the claim.');
      }
    }
  };

  const createClaim = async (overwrite = false) => {
    if (session?.user) {
      try {
        const isDev = process.env.NEXT_PUBLIC_IS_DEV === 'true';

        if (!isDev) {
          // Call the API to deduct a credit
          const response = await fetch('/api/deductCredit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Send an empty object if no data is needed
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Failed to deduct credit');
          }

          // Directly update the session's credit count
          await update({
            ...session,
            user: {
              ...session.user,
              credits: data.credits,
            },
          });

          // Show a toast for the production scenario
          toast.success(`One credit has been deducted. You have ${data.credits} credits left.`);
        } else {
          // Show a toast for the development scenario
          toast.success(`In production, one credit would have been deducted.`);
        }

        await axios.post("/api/claim", {
          userId: (session.user as any).id,
          claim,
          overwrite,
        });

        router.push(`/questionnaire?claim=${encodeURIComponent(claim)}`);
      } catch (err) {
        console.error(err);
        toast.error('An error occurred while creating the claim.');
      }
    }
  };

  return (
    <div className="relative flex w-full flex-col self-start px-20">
      <section className="flex h-screen w-full">
        <div className="items-between flex w-1/2 flex-col justify-center py-40">
          <span className="flex flex-col">
            <h1 className="font-roboto text-7xl">Green Claims Validator</h1>
            <p className="mt-2 font-poppins text-3xl">
              The first user-friendly app that empowers companies to verify the authenticity of their green claims.
            </p>
          </span>
          <div className="relative mt-12 flex items-center font-poppins">
            <input
              type="text"
              value={claim}
              onChange={handleClaimChange}
              placeholder="Enter your claim..."
              className="w-full rounded-full border dark:border-gray-700 dark:text-white border-gray-300 px-6 py-6 text-lg dark:bg-gray-700 text-gray-700 outline-green focus:border-green focus:outline-none focus:ring-2 focus:ring-green"
            />
            <button
              onClick={handleGetStartedClick}
              className="absolute right-2 flex items-center justify-center rounded-full bg-green px-6 py-4 text-lg text-white transition-all duration-200 hover:scale-105"
            >
              Try it for free
              <ArrowRightIcon className="ml-2 text-2xl" />
            </button>
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

      <dialog id="existingClaimModal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Existing Claim Found</h3>
          <p className="py-4">You already have an existing claim: {existingClaim}</p>
          <p className="py-4">Do you want to overwrite it with the new claim?</p>
          <div className="modal-action">
            <button className="btn" onClick={() => (document.getElementById("existingClaimModal") as HTMLDialogElement).close()}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                createClaim(true);
                (document.getElementById("existingClaimModal") as HTMLDialogElement).close();
              }}
            >
              Overwrite
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </div>
  );
}
