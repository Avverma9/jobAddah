import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ResponsiveShell from "@/components/ResponsiveShell";
import React, { Suspense } from "react";
import ClientTitle from "@/components/ClientTitle";
import "./globals.css";
import { keywords } from "@/lib/keywords";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.SITE_ORIGIN ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://jobsaddah.com";

const siteName = "JobsAddah";
const twitterHandle = "@jobsaddah";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default:
      "JobsAddah - JobsAddah 2026 | Latest Govt Jobs, Admit Card, Results",
    template: "%s | JobsAddah",
  },
  description:
    "JobsAddah is India's #1 sarkari result portal for latest government jobs 2025, sarkari naukri notifications, admit cards, exam results.",
  keywords,
  authors: [{ name: "JobsAddah" }],
  creator: "JobsAddah",
  publisher: "JobsAddah",
  openGraph: {
    title: "JobsAddah - JobsAddah 2026 | Latest Govt Jobs",
    description:
      "JobsAddah is India's #1 jobs portal for latest government jobs.",
    url: siteUrl,
    siteName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobsAddah - Govt and Pvt Jobs Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: twitterHandle,
    creator: twitterHandle,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.png?v=2",
    apple: "/logo.png?v=2",
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "employment",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientTitle />

        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-50">
              <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3" />
              <main />
            </div>
          }
        >
          <ResponsiveShell>{children}</ResponsiveShell>
        </Suspense>

        {/* ✅ Google AdSense Script (ONLY ONCE) */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5390089359360512"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
