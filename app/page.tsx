// app/page.tsx
"use client";
import { Earth } from "@/components/models/Earth";
import { LoadingSpinner } from "@/components/ui/base";
import { Environment, SoftShadows } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  ChevronRight,
  Command,
  Search,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Canvas } from "react-three-fiber";

interface CommandMenuItem {
  label: string;
  shortcut?: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

const NoiseBackground = () => (
  <svg className="fixed inset-0 h-full w-full opacity-[0.15] mix-blend-soft-light"
    viewBox="0 0 1024 1024"
    xmlns="http://www.w3.org/2000/svg"
  >
    <filter id='noiseFilter'>
      <feTurbulence
        type='fractalNoise'
        baseFrequency='0.6'
        stitchTiles='stitch'
        numOctaves='4'
      />
    </filter>
    <rect width='100%' height='100%' filter='url(#noiseFilter)' />
  </svg>
);

const GradientBackground = () => (
  <div
    className="fixed inset-0 bg-gradient-to-br from-green-50 via-white to-green-50 animate-gradient-slow"
    style={{
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}
  />
);

export default function Home() {
  const { data: session, update } = useSession();
  const [claim, setClaim] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandMenu(prev => !prev);
      }
      if (e.key === 'Escape') {
        setShowCommandMenu(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && claim.trim()) {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [claim]);

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error("Please sign in to continue", {
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
      return;
    }

    if (!claim.trim()) {
      toast.error("Please enter your claim", {
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/claims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ claim: claim.trim() }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      // router.push(`/questionnaire?claimId=${data.claim.id}`);
      router.push(`/claims/${data.claim.id}/questionnaire`);

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit claim. Please try again.", {
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const commandMenuItems: CommandMenuItem[] = [
    {
      label: "Create new claim",
      shortcut: "⌘ + Enter",
      onClick: handleSubmit,
      icon: <ArrowRightIcon className="h-4 w-4" />
    },
    {
      label: "View my claims",
      shortcut: "⌘ + P",
      onClick: () => router.push('/claims'),
      icon: <Search className="h-4 w-4" />
    },
    {
      label: "Clear input",
      shortcut: "⌘ + Delete",
      onClick: () => setClaim(''),
      icon: <X className="h-4 w-4" />
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <GradientBackground />
      <NoiseBackground />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative z-10 min-h-screen"
      >
        <div className="container mx-auto px-4 lg:px-8">
          <section className="flex min-h-screen flex-col lg:flex-row items-center justify-center gap-8 py-12 lg:py-0">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col justify-center lg:w-1/2 space-y-8"
            >
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm shadow-sm"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  <span className="text-gray-600">Green Claims Validator</span>
                </motion.div>

                <motion.h1
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Validate your green claims
                </motion.h1>

                <motion.p
                  className="text-lg md:text-xl text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  The first user-friendly app that empowers companies to verify their environmental impact claims with confidence.
                </motion.p>
              </div>

              <motion.div
                className="relative w-full max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className={`relative transition-all duration-200 ${isFocused ? 'scale-[1.02]' : 'scale-100'}`}>
                  <div className="relative bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/20">
                    <input
                      ref={inputRef}
                      type="text"
                      value={claim}
                      onChange={(e) => setClaim(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="Enter your green claim..."
                      disabled={isSubmitting}
                      className="w-full rounded-xl px-6 py-4 text-lg bg-transparent focus:outline-none text-gray-900 placeholder-gray-400"
                      aria-label="Enter your green claim"
                    />

                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-3">
                      <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md">
                        <Command className="h-3 w-3" />
                        <span>Enter</span>
                      </kbd>

                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        aria-label={isSubmitting ? "Submitting claim..." : "Validate claim"}
                        className={`
                          flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium
                          transition-all duration-200
                          ${isSubmitting
                            ? 'bg-[#F5F5F5] dark:bg-[#3F4447] text-[#6B6B6B] dark:text-[#9B9B9B]'
                            : 'bg-[#2ecc71] hover:bg-[#27ae60] text-white'
                          }
                          focus:outline-none focus:ring-2 focus:ring-[#2ecc71] focus:ring-offset-2
                          disabled:cursor-not-allowed
                        `}
                      >
                        {isSubmitting ? (
                          <LoadingSpinner />
                        ) : (
                          <>
                            Validate
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.div
                    className="mt-3 flex items-center justify-end space-x-4 text-xs text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <span className="flex items-center gap-1">
                      <Command className="h-3 w-3" /> K
                      <span className="ml-1">for commands</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      <span className="ml-1">to search claims</span>
                    </span>
                  </motion.div>
                </div>

                {!session && (
                  <motion.div
                    className="mt-4 flex items-center space-x-2 text-sm text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Please sign in to validate your claims</span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Right Content - 3D Model */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:w-1/2 h-[400px] lg:h-[600px] w-full relative z-10"
            >
              <Canvas className="w-full h-full">
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} />
                <SoftShadows samples={100} />
                <Environment preset="sunset" />
                <Suspense fallback={null}>
                  <Earth scale={3} position={[0, 0, 0]} />
                </Suspense>
              </Canvas>
            </motion.div>
          </section>
        </div>

        {/* Command Menu */}
        <AnimatePresence>
          {showCommandMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed inset-x-0 top-24 z-50 mx-auto max-w-xl overflow-hidden rounded-lg bg-white/80 backdrop-blur-md shadow-lg border border-white/20"
            >
              <div className="p-4">
                <input
                  type="text"
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent border-none p-2 text-gray-900 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="border-t border-gray-200">
                {commandMenuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <kbd className="px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}