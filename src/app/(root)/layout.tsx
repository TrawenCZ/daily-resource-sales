import LoginButton from "@/components/LoginButton";
import Bottombar from "@/components/navigation/Bottombar";
import Topbar from "@/components/navigation/Topbar";
import Providers from "@/components/Providers";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UzávěrkyOnline",
  description: "Vlastní aplikace pro správu denních uzávěrek.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  return (
    <html lang="en" data-theme="light">
      <body className={inter.className + " text-base-content"}>
        <Providers>
          {session ? (
            <div className="flex flex-col w-screen h-screen bg-base-100">
              <Topbar />
              <Bottombar />
              {children}
            </div>
          ) : (
            <LoginButton />
          )}
        </Providers>
      </body>
    </html>
  );
}
