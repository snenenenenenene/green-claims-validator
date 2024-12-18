"use client";

import { User } from "@prisma/client";
import { FileText, LogOut, Users } from "lucide-react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Popover } from '../ui/base/index';

export default function UserDropdown({ session }: { session: Session }) {
  const { email, image } = session?.user || {};
  const [openPopover, setOpenPopover] = useState(false);

  if (!email) return null;

  return (
    <div className="relative inline-block text-left">
      <Popover
        content={
          <div className="w-full rounded-md dark:bg-gray-900 p-2 sm:w-56">
            <div className="p-2">
              {session?.user?.name && (
                <p className="truncate font-medium text-sm">
                  {session?.user?.name}
                </p>
              )}
              <p className="truncate text-sm">
                {session?.user?.email}
              </p>
            </div>

            <Link
              href="/claims"
              className="hover:bg-primary-hover relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75"
            >
              <FileText className="h-4 w-4" />
              <p className="text-sm">My Claims</p>
            </Link>

            {(session?.user as User).role === "ADMIN" && (
              <>
                <Link
                  href="/admin"
                  className="hover:bg-primary-hover relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75"
                >
                  <Users className="h-4 w-4" />
                  <p className="text-sm">Admin Dashboard</p>
                </Link>
              </>
            )}

            <button
              className="hover:bg-primary-hover relative flex w-full items-center justify-start space-x-2 rounded-md p-2 text-left text-sm transition-all duration-75"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
              <p className="text-sm">Logout</p>
            </button>
          </div>
        }
        align="end"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-gray-300 transition-all duration-75 focus:outline-none active:scale-95 sm:h-9 sm:w-9"
        >
          <Image
            alt={email}
            src={image || `https://api.dicebear.com/9.x/pixel-art/svg?seed=${(session?.user as any).email}`}
            width={40}
            height={40}
          />
        </button>
      </Popover>
    </div>
  );
}