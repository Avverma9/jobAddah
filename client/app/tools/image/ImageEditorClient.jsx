"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import useIsMobile from "@/hooks/useIsMobile";
import { BgRemover } from "@/lib/image-tool/bgRemover";
import { PhotoMakerTool } from "@/lib/image-tool/passport";
import { OverlayTool } from "@/lib/image-tool/overlay";
import { ResizerTool } from "@/lib/image-tool/resizer";
import { JoinerTool } from "@/lib/image-tool/joiner";
import {
  Columns,
  Eraser,
  Layers,
  Layout,
  Maximize2,
} from "lucide-react";

const TOOL_TABS = [
  { id: "photo-maker", icon: Layout, label: "Passport Photo" },
  { id: "bg-remover", icon: Eraser, label: "BG Remover" },
  { id: "overlay", icon: Layers, label: "Overlay" },
  { id: "resizer", icon: Maximize2, label: "Resizer" },
  { id: "joiner", icon: Columns, label: "Joiner" },
];

export default function ImageEditor() {
  const isMobile = useIsMobile(640);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState("photo-maker");
  const [sharedImage, setSharedImage] = useState(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleSharedImage = useCallback((imgOrUrl) => {
    if (!imgOrUrl) {
      setSharedImage(null);
      return;
    }

    if (typeof imgOrUrl === "string") {
      const img = new Image();
      img.onload = () => setSharedImage(img);
      img.src = imgOrUrl;
      return;
    }

    if (imgOrUrl instanceof HTMLCanvasElement) {
      const img = new Image();
      img.onload = () => setSharedImage(img);
      img.src = imgOrUrl.toDataURL();
      return;
    }

    setSharedImage(imgOrUrl);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "photo-maker":
        return (
          <PhotoMakerTool
            key={sharedImage?.src || "photo-maker"}
            sharedImage={sharedImage}
            setSharedImage={handleSharedImage}
          />
        );
      case "bg-remover":
        return (
          <BgRemover
            key={sharedImage?.src || "bg-remover"}
            sharedImage={sharedImage}
            setSharedImage={handleSharedImage}
          />
        );
      case "overlay":
        return (
          <OverlayTool
            key={sharedImage?.src || "overlay"}
            sharedImage={sharedImage}
            setSharedImage={handleSharedImage}
          />
        );
      case "resizer":
        return (
          <ResizerTool
            key={sharedImage?.src || "resizer"}
            sharedImage={sharedImage}
            setSharedImage={handleSharedImage}
          />
        );
      case "joiner":
        return (
          <JoinerTool
            key={sharedImage?.src || "joiner"}
            sharedImage={sharedImage}
            setSharedImage={handleSharedImage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="force-light">
      <style jsx global>{`
        .force-light .dark\:bg-slate-900,
        .force-light .dark\:bg-slate-800,
        .force-light .dark\:bg-slate-700,
        .force-light .dark\:bg-slate-700\/50,
        .force-light .dark\:bg-slate-600 {
          background-color: transparent !important;
          background-image: none !important;
        }

        .force-light .dark\:text-slate-100,
        .force-light .dark\:text-slate-400,
        .force-light .dark\:text-gray-300,
        .force-light .dark\:text-slate-200 {
          color: inherit !important;
        }

        .force-light .dark\:border-slate-700,
        .force-light .dark\:border-slate-600 {
          border-color: rgba(0, 0, 0, 0.08) !important;
        }

        .force-light .dark\:hover\:bg-slate-700 {
          background-color: #f1f5f9 !important;
        }
      `}</style>

      <div
        className={`min-h-screen bg-gray-50 p-2 md:p-6 font-sans text-slate-900 ${
          hydrated && isMobile ? "pb-24" : ""
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <header className="mb-6 text-center">
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Image Master Suite
            </h1>
            <p className="text-sm text-slate-500">
              Professional tools for everyday tasks
            </p>
          </header>

          <div className="grid lg:grid-cols-[1fr_auto] gap-6">
            <div>
              <div className="flex flex-wrap justify-center gap-2 mb-6 bg-white p-2 rounded-xl shadow-sm border border-gray-100 w-fit mx-auto">
                {TOOL_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-slate-600 hover:bg-gray-100"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden md:inline">{tab.label}</span>
                  </button>
                ))}
              </div>

              <div className="transition-all duration-300">{renderContent()}</div>
            </div>
          </div>

          <section className="mt-10 bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-3">
              How to use these image tools
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>1. Upload a clear photo with good lighting and a plain background.</li>
              <li>2. Use BG Remover or Passport Photo tools to meet form rules.</li>
              <li>3. Download and reuse the same image across applications.</li>
            </ul>
            <p className="text-xs text-slate-500 mt-4">
              Tip: Keep file size under 100-200KB if your application portal is strict.
            </p>
          </section>
          <section className="mt-6 bg-white border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Quick FAQ</h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>Is this free? Yes, these tools are free to use.</li>
              <li>Will my images be stored? No, everything runs in your browser.</li>
              <li>Need more guidance? Read the JobsAddah guide.</li>
            </ul>
            <Link
              href="/guides/why-jobsaddah"
              className="inline-flex mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Read the full guide
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
