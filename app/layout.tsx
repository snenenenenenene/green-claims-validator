import "./globals.css";
import cx from "classnames";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

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
      <body className="flex h-screen w-screen flex-col bg-white text-black">
        <Suspense fallback="...">
          <Nav />
        </Suspense>
        <main className="text-display flex h-full min-h-full w-full flex-col px-4 pt-20">
          {children}
        </main>
        {/* <Footer /> */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
