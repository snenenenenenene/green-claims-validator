"use client";

import Image from "next/image";
import Link from "next/link";
import useScroll from "@/lib/hooks/use-scroll";
import { useSignInModal } from "./sign-in-modal";
import UserDropdown from "./user-dropdown";
import { Session } from "next-auth";
import Loader from "../shared/loader";

export default function NavBar({ session }: { session: Session | null }) {
  const { SignInModal, setShowSignInModal } = useSignInModal();
  const scrolled = useScroll(50);

  return (
    <>
      <SignInModal />
      <div
        className={`fixed top-0 flex w-full justify-center ${
          scrolled ? " bg-primary/50 backdrop-blur-xl" : "bg-primary/0"
        } z-30 transition-all`}
      >
        <div className="mx-5 flex h-24 w-full items-center justify-between">
          <Link href="/" className="flex items-center font-roboto text-4xl">
            <Image
              src="/logo.webp"
              alt="Green Claims Validator logo"
              width="80"
              height="80"
              className="mr-0 rounded-sm"
            ></Image>
            <p>GCV</p>
          </Link>
          <section className="flex items-center gap-4 font-medium text-lg">
            <div>
              {session ? (
                <UserDropdown session={session} />
              ) : (
                <button
                  className="rounded-full border border-yellow bg-yellow p-1.5 px-8 py-4 text-black transition-all hover:border-yellow-hover hover:bg-yellow-hover"
                  onClick={() => setShowSignInModal(true)}
                >
                  Try Green Claims Validator for Free
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
