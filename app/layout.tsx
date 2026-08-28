import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { SwRegister } from "@/components/sw-register";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "V6 Render — Architectural Rendering Extension for SketchUp",
  description:
    "Generate photorealistic 4K renders and 3D video walkthroughs from any SketchUp view. 100% geometry preservation, zero GPU needed.",
  keywords: [
    "V6 Render",
    "SketchUp render",
    "SketchUp architectural rendering",
    "photorealistic SketchUp",
    "3D walkthrough",
    "architectural visualization",
    "interior design rendering",
    "PBR materials",
  ],
  robots: "index, follow",
  openGraph: {
    title: "V6 Render — Architectural Rendering Extension for SketchUp",
    description:
      "Generate photorealistic 4K renders and 3D video walkthroughs from any SketchUp view with 100% geometry preservation.",
    url: "https://www.avada.space/",
    siteName: "V6 Render",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/v6-logo.png",
        width: 392,
        height: 262,
        alt: "V6 Render - SketchUp Architectural Rendering Extension",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "V6 Render — Architectural Rendering Extension for SketchUp",
    description:
      "Photorealistic SketchUp rendering software built for architects and interior designers.",
    images: ["/v6-logo.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/v6-logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen overflow-x-hidden antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
        <SwRegister />
        <Analytics />
      </body>
    </html>
  );
}
