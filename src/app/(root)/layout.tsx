import LoginButton from "@/components/LoginButton";
import Navbar from "@/components/Navbar";
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
            <>
              <Navbar />
              {children}
            </>
          ) : (
            <LoginButton />
          )}
        </Providers>
      </body>
    </html>
  );
}
