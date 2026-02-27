"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function PostPageShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Header
        scrolled
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <main className="flex-grow pt-24 sm:pt-28">{children}</main>

      <Footer />
    </div>
  );
}
