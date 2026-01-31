"use client";

import React, { useState, useEffect } from "react";
import { BellRing, Send, X, Check } from "lucide-react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function FloatingSubscribe() {
  const [open, setOpen] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Hide widget if already subscribed
  useEffect(() => {
    if (typeof window === "undefined") return;
    const flag = window.localStorage.getItem("jobsaddah-subscriber");
    if (flag === "true") {
      setHidden(true);
      setOpen(false);
      setMinimized(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!name.trim() || !email.trim()) {
      setError("Naam aur email dono zaroori hai.");
      return;
    }
    if (!API_BASE) {
      setError("API base URL missing (NEXT_PUBLIC_API_URL).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error("Subscription failed");
      setMessage("Subscribed! Aapko jaldi notifications milenge.");
      setName("");
      setEmail("");
      if (typeof window !== "undefined") {
        window.localStorage.setItem("jobsaddah-subscriber", "true");
      }
      setHidden(true);
      setOpen(false);
      setMinimized(false);
    } catch (err) {
      setError("Kuch galat ho gaya, dubara koshish karein.");
    } finally {
      setLoading(false);
    }
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && !minimized ? (
        <div className="relative">
          <div className="absolute -top-6 right-0 flex items-center gap-2 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg animate-bounce">
            <BellRing className="w-4 h-4" /> Subscribe for job notifications
          </div>
          <div className="w-80 max-w-[90vw] bg-white border border-slate-200 shadow-xl rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <BellRing className="w-5 h-5 text-emerald-600" />
                Instant Job Alerts
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setMinimized(true);
                  setMessage("");
                  setError("");
                }}
                className="text-slate-400 hover:text-slate-600"
                aria-label="Close subscription widget"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Naam aur email daalein, hum aapko latest job notifications send
              karenge. Form bharne se pehle updates miss na karein!
            </p>
            <form onSubmit={handleSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              />
              {error && <div className="text-xs text-red-600">{error}</div>}
              {message && (
                <div className="text-xs text-emerald-700 flex items-center gap-1">
                  <Check className="w-4 h-4" /> {message}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-emerald-700 transition-colors disabled:opacity-70"
              >
                <Send className="w-4 h-4" />
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {minimized && (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setMinimized(false);
          }}
          className="w-12 h-12 rounded-full bg-emerald-600 text-white shadow-xl flex items-center justify-center hover:bg-emerald-700 transition-transform hover:scale-105"
          aria-label="Open subscription form"
        >
          <BellRing className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
