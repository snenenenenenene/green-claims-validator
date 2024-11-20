"use client";

import { Coins, Mail, Shield } from "lucide-react";
import { SessionProvider, useSession } from "next-auth/react";
import Image from 'next/image';
import Link from 'next/link';

function FooterContent() {
  const { data: session } = useSession();

  return (
    <footer className="relative z-20 mt-auto bg-white/80 backdrop-blur-sm border-t border-gray-200 font-satoshi">
      <div className="container mx-auto px-6">
        <div className="footer-wrapper py-16">
          <Link href="/" className="footer-brand inline-block flex items-center gap-4">
            <Image
              src="/logo.png"
              width={56}
              height={56}
              alt="Green Claims Validator"
              className="rounded-sm"
            />
            <h2 className="text-xl font-bold text-gray-900 md:text-3xl md:font-extrabold md:text-gray-800">
              Green Claims Validator
            </h2>
          </Link>

          <div className="footer-content grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                NAVIGATION
              </div>
              <div className="flex flex-col space-y-3">
                <Link href="/" className="footer-link text-gray-600 hover:text-black">
                  Home
                </Link>
                {session ? (
                  <>
                    <Link href="/claims" className="footer-link text-gray-600 hover:text-black">
                      My Claims
                    </Link>
                    <Link href="/payments" className="footer-link text-gray-600 hover:text-black">
                      Credits
                    </Link>
                  </>
                ) : (
                  <Link href="/" className="footer-link text-gray-600 hover:text-black">
                    Get Started
                  </Link>
                )}
              </div>
            </div>

            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                FEATURES
              </div>
              <div className="flex flex-col space-y-3">
                <span className="footer-link text-gray-600">
                  Claim Validation
                </span>
                <span className="footer-link text-gray-600">
                  Environmental Impact Analysis
                </span>
                <span className="footer-link text-gray-600">
                  Sustainability Metrics
                </span>
              </div>
            </div>

            <div className="footer-block">
              <div className="footer-title-small text-xs font-medium tracking-wider text-gray-500 mb-4">
                RESOURCES
              </div>
              <div className="flex flex-col space-y-3">
                {session?.user && (session.user as any).role === "admin" && (
                  <Link href="/admin" className="footer-link text-gray-600 hover:text-black">
                    Admin Dashboard
                  </Link>
                )}
                {session && (
                  <Link href="/dashboard" className="footer-link text-gray-600 hover:text-black">
                    Validation Dashboard
                  </Link>
                )}

              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="footer-row flex flex-col md:flex-row justify-between items-center py-8">
          <div className="footer-2-left text-gray-600 text-sm mb-4 md:mb-0">
            © 2024 Green Claims Validator | Created by{' '}
            <a
              href="https://www.specularconsulting.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:text-black font-medium"
            >
              Specular Consulting
            </a>
          </div>

          <div className="footer-2-right">
            <ul className="social-icons-list flex space-x-4 items-center">
              <li className="list-item">
                <a
                  href="mailto:greenclaimsvalidator@specular.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                >
                  <Mail size={20} />
                </a>
              </li>
              {session && (
                <li className="list-item">
                  <Link
                    href="/payments"
                    className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                  >
                    <Coins size={20} />
                  </Link>
                </li>
              )}
              {session?.user && (session.user as any).role === "admin" && (
                <li className="list-item">
                  <Link
                    href="/admin"
                    className="footersocialicons w-8 h-8 flex items-center justify-center hover:opacity-75 text-gray-600 hover:text-black"
                  >
                    <Shield size={20} />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <SessionProvider>
      <FooterContent />
    </SessionProvider>
  );
}