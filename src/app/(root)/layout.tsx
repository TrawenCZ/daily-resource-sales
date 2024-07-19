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
      <meta
        name="viewport"
        content="viewport-fit=cover width=device-width, initial-scale=1.0"
      />
      <body className={inter.className + " text-base-content"}>
        <Providers>
          {session ? (
            <>
              <Topbar />
              <Bottombar />
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
