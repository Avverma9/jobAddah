import { Geist, Geist_Mono } from "next/font/google";
import ResponsiveShell from '@/components/ResponsiveShell'
import React, { Suspense } from 'react';
import ClientTitle from '@/components/ClientTitle'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com";
const siteName = "JobsAddah";
const twitterHandle = "@jobsaddah";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "JobsAddah - JobsAddah 2026 | Latest Govt Jobs, Admit Card, Results",
    template: "%s | JobsAddah",
  },
  description: "JobsAddah is India's #1 sarkari result portal for latest government jobs 2025, sarkari naukri notifications, admit cards, exam results. Get SSC, Railway, Bank, UPSC job alerts.",
  keywords: [
    "sarkari result", "sarkari result 2025", "sarkari result 2026", "sarkari naukri", "sarkari naukri 2025", 
    "government jobs", "govt jobs 2025", "latest govt jobs", "central govt jobs", "state govt jobs", 
    "free job alert", "rojgar samachar", "bharti 2025", "ssc jobs", "ssc cgl", "ssc chsl", "ssc mts", 
    "ssc gd", "railway jobs", "rrb ntpc", "rrb group d", "bank jobs", "ibps po", "ibps clerk", 
    "sbi po", "upsc", "upsc cds", "upsc nda", "bpsc", "uppsc", "mppsc", "police bharti", 
    "teacher recruitment", "ctet", "admit card", "result", "answer key", "online form", "syllabus", 
    "private jobs", "it jobs", "work from home"
  ],
  authors: [{ name: "JobsAddah" }],
  creator: "JobsAddah",
  publisher: "JobsAddah",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "JobsAddah - JobsAddah 2026 | Latest Govt Jobs, Admit Card, Results",
    description: "JobsAddah is India's #1 jobs portal for latest government jobs 2026, sarkari naukri notifications, admit cards, exam results.",
    url: siteUrl,
    siteName: siteName,
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JobsAddah - Govt and Pvt Jobs Portal',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "JobsAddah - JobsAddah 2026",
    description: "JobsAddah is India's #1 sarkari result portal for latest government jobs 2025.",
    site: twitterHandle,
    creator: twitterHandle,
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'employment',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5390089359360512" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientTitle />
        <Suspense fallback={
          <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3" />
            <main />
          </div>
        }>
          <ResponsiveShell>{children}</ResponsiveShell>
        </Suspense>
      </body>
    </html>
  );
}