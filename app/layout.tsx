import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-Puzzle-A-Day",
  description: "Fit all 10 pieces on the board to reveal today's month, day, and weekday. A daily calendar puzzle.",
  openGraph: {
    title: "A-Puzzle-A-Day",
    description: "Fit all 10 pieces on the board to reveal today's month, day, and weekday.",
    type: "website",
    url: "https://calendar-solver.vercel.app",
    images: [{ url: "https://calendar-solver.vercel.app/preview.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "A-Puzzle-A-Day",
    description: "Fit all 10 pieces on the board to reveal today's month, day, and weekday.",
    images: ["https://calendar-solver.vercel.app/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
