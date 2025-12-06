import type { Metadata } from "next";
import { Roboto } from "next/font/google"; 
import "./globals.css";
import { Providers } from "./providers";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Study Gap AI",
  description: "Analyze your syllabus and find missing topics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
