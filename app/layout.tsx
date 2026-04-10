import "./globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Wrapper from "@/components/wrapper";
import { Analytics } from "@vercel/analytics/next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: "Jhanny Globe | Interactive 3D World Visualization",
  description:
    "This 3d globe visualisation shows countries that Jahny have visited and the ones I plan to visit.",
  openGraph: {
    title: "Jhanny Globe | Interactive 3D World Visualization",
    description:
      "This 3d globe visualisation shows countries that Jahny have visited and the ones I plan to visit.",
    images: ["/screenshot.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jhanny Globe | Interactive 3D World Visualization",
    description:
      "This 3d globe visualisation shows countries that Jahny have visited and the ones I plan to visit.",
    images: ["/screenshot.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          "bg-[#010101]",
          geistSans.variable,
          geistMono.variable,
        )}>
        <Wrapper>{children}</Wrapper>
        <Analytics />
      </body>
    </html>
  );
}
