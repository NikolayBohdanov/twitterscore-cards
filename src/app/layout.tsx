import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TwitterScore Card Generator",
  description: "Generate Weekly Smart Drop cards for Twitter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0 }}>
        <div style={{ minHeight: "100vh", background: "#0a0e17", color: "white" }}>
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
