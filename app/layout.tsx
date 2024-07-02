import "./globals.css";
import cx from "classnames";
import Nav from "@/components/layout/nav";
import Footer from "@/components/layout/footer";
import { Suspense } from "react";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Lutrify - Greenwashing Verification",
  description:
    "Lutrify is a platform that verifies the sustainability of products and services.",
  // metadataBase: new URL("ADD PROD URL"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen w-screen flex-col bg-green text-white">
        <Suspense fallback="...">
          <Nav />
        </Suspense>
        <main className="text-display flex h-full min-h-full w-full flex-col p-20 pt-20">
          {children}
        </main>
        {/* <Footer /> */}
        <VercelAnalytics />
      </body>
    </html>
  );
}
