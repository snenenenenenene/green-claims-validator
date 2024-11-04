import "./globals.css";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SessionProvider } from "next-auth/react";
import Providers from "@/components/providers";

export const metadata = {
  title: "Green Claims Validator - Greenwashing Verification",
  description:
    "Green Claims Validator is a platform that verifies the sustainability of products and services.",
  // metadataBase: new URL("ADD PROD URL"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen h-full w-screen flex-col bg-white b dark:bg-slate-800 dark:text-white text-black">
        <Suspense fallback="...">
          <Nav />
        </Suspense>
        <Providers>
          <main className="text-display flex h-screen w-full flex-col pt-20">
            {children}
          </main>
        </Providers>
        <Footer />
        <VercelAnalytics />
      </body>
    </html>
  );
}
