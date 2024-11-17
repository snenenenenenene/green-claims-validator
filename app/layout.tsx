import Footer from "@/components/layout/footer";
import Nav from "@/components/layout/nav";
import Providers from "@/components/providers";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { Suspense } from "react";
import "./globals.css";

export const metadata = {
  title: "Green Claims Validator - Greenwashing Verification",
  description:
    "Green Claims Validator is a platform that verifies the sustainability of products and services.",
  metadataBase: new URL(`${process.env.VERCEL_URL}`),
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
          <main className="text-display overflow-scroll flex h-screen w-full flex-col pt-20">
            {children}
          </main>
        </Providers>
        <Footer />
        <VercelAnalytics />
      </body>
    </html>
  );
}
