"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import Loader from "../shared/loader";
import { Coins } from "lucide-react";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 flex w-full justify-center ${scrolled ? " bg-primary/50 backdrop-blur-xl" : "bg-primary/0"
          } z-30 transition-all`}
      >
        <div className="mx-5 flex h-24 w-full items-center justify-between">
          <Link href="/" className="flex items-center font-roboto text-4xl">
            <Image
              src="/logo.png"
              alt="Green Claims Validator logo"
              width="120"
              height="120"
              className="mr-0 rounded-sm"
            ></Image>
          </Link>
          <section className="flex items-center gap-4 text-lg font-medium">
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <Link href={"/payments"} className="flex btn  font-medium">
                    <span className="text-xl font-roboto">{(session.user as any).credits}</span>
                    <Coins className="text-xl" />
                  </Link>
                  <UserDropdown session={session} />
                </>
              ) : (
                <button
                  className="rounded-full p-1.5 px-8 py-4 font-roboto text-xl text-gray-400 transition-all duration-200 hover:text-black hover:underline"
                  onClick={() => setShowSignInModal(true)}
                >
                  Log in
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
