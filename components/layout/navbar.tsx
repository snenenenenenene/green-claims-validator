"use client";

import useScroll from "@/lib/hooks/use-scroll";
import { motion } from "framer-motion";
import { ChevronRight, Coins } from "lucide-react";
import { Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);

  return (
    <>
      <SignInModal />
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 flex w-full justify-center ${scrolled
          ? "bg-white/50 backdrop-blur-xl border-b border-gray-200/50"
          : "bg-white/0"
          } z-30 transition-all duration-300`}
      >
        <div className="mx-5 flex h-16 w-full max-w-screen-xl items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Green Claims Validator logo"
                width="100"
                height="100"
                className="rounded-sm"
              />
            </Link>

          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href="/payments"
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 transition-all duration-200 hover:shadow-sm"
                  >
                    <span className="text-sm font-medium text-gray-900">
                      {(session.user as any).credits}
                    </span>
                    <Coins className="h-4 w-4 text-gray-600" />
                  </Link>
                </motion.div>
                <div className="h-6 w-px bg-gray-200" />
                <UserDropdown session={session} />
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSignInModal(true)}
                className="flex items-center gap-2 px-6 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-md"
              >
                Log in
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}