import React, { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl as API_BASE } from "../../../util/url";

const PUBLISHER_ID = "ca-pub-5390089359360512";

/**
 * Central Axios Instance
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "X-Publisher-ID": PUBLISHER_ID,
    "Content-Type": "application/json",
  },
});

export default function GoogleAdsManager() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [stats, setStats] = useState({
    totalSlots: 0,
    activeSlots: 0,
    activePages: 0,
    lastUpdated: new Date().toISOString(),
  });

  /* =========================
     FETCH CURRENT AD CONFIG
     ========================= */
  const fetchConfig = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/ad-config");
      setConfig(res.data);
      
      // Calculate stats
      const slots = Object.keys(res.data.adSlots || {});
      const activeSlots = slots.filter(
        (s) => res.data.adSlots[s].enabled
      ).length;
      const pages = Object.keys(res.data.pageSettings || {});
      const activePages = pages.filter(
        (p) => res.data.pageSettings[p].enabled
      ).length;

      setStats({
        totalSlots: slots.length,
        activeSlots,
        activePages,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  /* =========================
     API HANDLERS
     ========================= */
  const updateGlobal = async (payload) => {
    try {
      await api.post("/ad-config/global", {
        publisherId: PUBLISHER_ID,
        ...payload,
      });
      await fetchConfig();
    } catch (err) {
      setError("Failed to update global settings");
    }
  };

  const updatePage = async (page, payload) => {
    try {
      await api.post(`/ad-config/page/${page}`, {
        publisherId: PUBLISHER_ID,
        ...payload,
      });
      await fetchConfig();
    } catch (err) {
      setError(`Failed to update ${page} settings`);
    }
  };

  const updateSlot = async (slot, payload) => {
    try {
      await api.post(`/ad-config/slot/${slot}`, {
        publisherId: PUBLISHER_ID,
        ...payload,
      });
      await fetchConfig();
    } catch (err) {
      setError(`Failed to update ${slot} slot`);
    }
  };

  const emergencyDisable = async () => {
    if (
      !window.confirm(
        "⚠️ This will immediately disable ALL ads across your entire platform. Continue?"
      )
    )
      return;

    try {
      await api.post("/ad-config/emergency-disable", {
        publisherId: PUBLISHER_ID,
        reason: "Emergency disable by admin",
        disabledBy: "admin",
      });
      await fetchConfig();
    } catch (err) {
      setError("Failed to disable ads");
    }
  };

  const enableAds = async () => {
    try {
      await api.post("/ad-config/enable", {
        publisherId: PUBLISHER_ID,
        reason: "Re-enabled after review",
        enabledBy: "admin",
      });
      await fetchConfig();
    } catch (err) {
      setError("Failed to enable ads");
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error && !config)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <ErrorCard message={error} onRetry={fetchConfig} />
      </div>
    );

  if (!config) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/80">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Google Ads Control Center
                </h1>
                <p className="text-sm text-gray-500">
                  Publisher ID: {PUBLISHER_ID}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-all duration-200 hover:shadow-lg"
            >
              {showGuide ? "Hide Guide" : "📖 Quick Guide"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-slideDown">
            <span className="text-2xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        )}

        {/* GUIDE */}
        {showGuide && (
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-1 shadow-2xl animate-fadeIn">
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Quick Start Guide
                </h2>
                <button
                  onClick={() => setShowGuide(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <GuideCard
                  icon="🌍"
                  title="Global Control"
                  description="Master switch to enable/disable all ads across your platform"
                />
                <GuideCard
                  icon="📄"
                  title="Page Control"
                  description="Fine-tune ad display for specific pages (Home, Profile, etc.)"
                />
                <GuideCard
                  icon="🎯"
                  title="Slot Control"
                  description="Manage individual ad units (Banners, In-feed, Interstitials)"
                />
                <GuideCard
                  icon="🚨"
                  title="Emergency Actions"
                  description="Quick disable for AdSense policy violations or urgent issues"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <span className="text-xl">💡</span>
                <p className="text-sm text-amber-900">
                  <strong>Pro Tip:</strong> All changes are applied immediately
                  and affect your live application. Use Emergency Disable if you
                  receive AdSense warnings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STATS DASHBOARD */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon="🎯"
            label="Master Status"
            value={config.adsEnabled ? "Active" : "Disabled"}
            color={config.adsEnabled ? "green" : "red"}
            pulse={config.adsEnabled}
          />
          <StatCard
            icon="📊"
            label="Active Slots"
            value={`${stats.activeSlots}/${stats.totalSlots}`}
            color="blue"
          />
          <StatCard
            icon="📄"
            label="Active Pages"
            value={stats.activePages}
            color="purple"
          />
          <StatCard
            icon="🕐"
            label="Last Updated"
            value={new Date(stats.lastUpdated).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            color="gray"
          />
        </div>

        {/* GLOBAL CONTROL */}
        <ProfessionalCard
          icon="🌍"
          title="Global Ad Control"
          subtitle="Master controls for all advertising across your platform"
          color="blue"
        >
          <div className="space-y-4">
            <ToggleRow
              label="Master Ad Switch"
              description="Enable or disable all advertisements globally"
              value={config.adsEnabled}
              onChange={(v) => updateGlobal({ adsEnabled: v })}
              importance="critical"
            />
            <ToggleRow
              label="Display Ads on Site"
              description="Control visibility of ads across all pages"
              value={config.globalSettings?.showAds}
              onChange={(v) => updateGlobal({ showAds: v })}
              importance="high"
            />
          </div>
        </ProfessionalCard>

        {/* PAGE CONTROL */}
        <ProfessionalCard
          icon="📄"
          title="Page-Specific Controls"
          subtitle="Manage ad visibility for individual pages"
          color="purple"
        >
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(config.pageSettings || {}).map(
              ([page, settings]) => (
                <PageCard
                  key={page}
                  page={page}
                  enabled={settings.enabled}
                  onChange={(v) => updatePage(page, { enabled: v })}
                />
              )
            )}
          </div>
        </ProfessionalCard>

        {/* SLOT CONTROL */}
        <ProfessionalCard
          icon="🎯"
          title="Ad Slot Management"
          subtitle="Configure individual ad units and placements"
          color="indigo"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(config.adSlots || {}).map(([slot, settings]) => (
              <SlotCard
                key={slot}
                slot={slot}
                enabled={settings.enabled}
                onChange={(v) => updateSlot(slot, { enabled: v })}
              />
            ))}
          </div>
        </ProfessionalCard>

        {/* EMERGENCY CONTROLS */}
        <ProfessionalCard
          icon="🚨"
          title="Emergency Actions"
          subtitle="Critical controls for urgent situations"
          color="red"
        >
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">
                  Quick Action Required?
                </h3>
                <p className="text-sm text-gray-600">
                  Use these controls only for AdSense policy violations,
                  technical issues, or urgent situations requiring immediate
                  action.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={emergencyDisable}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <span>🚫</span>
                  Emergency Disable
                </button>
                <button
                  onClick={enableAds}
                  disabled={config.adsEnabled}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 text-white font-semibold hover:from-green-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  <span>✅</span>
                  Re-Enable Ads
                </button>
              </div>
            </div>
          </div>
        </ProfessionalCard>

        {/* FOOTER INFO */}
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            All changes are applied in real-time • Last sync:{" "}
            {new Date(stats.lastUpdated).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* STYLES */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

/* =====================
   PROFESSIONAL COMPONENTS
===================== */

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="text-center text-gray-500 mt-8">
          Loading Control Center...
        </div>
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }) {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
      <div className="text-6xl mb-4">❌</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Something Went Wrong
      </h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        Try Again
      </button>
    </div>
  );
}

function ProfessionalCard({ icon, title, subtitle, color, children }) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    indigo: "from-indigo-500 to-purple-500",
    red: "from-red-500 to-orange-500",
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
      <div
        className={`h-2 bg-gradient-to-r ${colorClasses[color] || colorClasses.blue}`}
      ></div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, pulse }) {
  const colorClasses = {
    green: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    red: "from-red-500 to-orange-500",
    gray: "from-gray-500 to-slate-500",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-3xl">{icon}</span>
        {pulse && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p
        className={`text-2xl font-bold bg-gradient-to-r ${colorClasses[color] || colorClasses.gray} bg-clip-text text-transparent`}
      >
        {value}
      </p>
    </div>
  );
}

function GuideCard({ icon, title, description }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-md">
      <div className="flex gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, value, onChange, importance }) {
  const importanceColors = {
    critical: "peer-checked:bg-gradient-to-r peer-checked:from-red-600 peer-checked:to-red-700",
    high: "peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-emerald-600",
    normal: "peer-checked:bg-blue-600",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer ${importanceColors[importance] || importanceColors.normal} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner`}
        ></div>
      </label>
    </div>
  );
}

function PageCard({ page, enabled, onChange }) {
  const pageIcons = {
    home: "🏠",
    profile: "👤",
    search: "🔍",
    messages: "💬",
    settings: "⚙️",
  };

  const pageIcon =
    pageIcons[page.toLowerCase()] || "📄";

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all duration-300 cursor-pointer ${
        enabled
          ? "border-green-500 bg-green-50 hover:bg-green-100"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
      onClick={() => onChange(!enabled)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{pageIcon}</span>
          <div>
            <h3 className="font-semibold text-gray-900 capitalize">{page}</h3>
            <p className="text-xs text-gray-500">
              {enabled ? "Active" : "Disabled"}
            </p>
          </div>
        </div>
        <div
          className={`w-3 h-3 rounded-full ${enabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}`}
        ></div>
      </div>
    </div>
  );
}

function SlotCard({ slot, enabled, onChange }) {
  const slotIcons = {
    banner: "🎯",
    infeed: "📰",
    interstitial: "📱",
    native: "🔲",
    video: "🎥",
    rewarded: "🎁",
  };

  const slotIcon =
    slotIcons[slot.toLowerCase().split("_")[0]] || "🎯";

  return (
    <div
      className={`rounded-xl p-4 border-2 transition-all duration-300 cursor-pointer ${
        enabled
          ? "border-blue-500 bg-blue-50 hover:bg-blue-100"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100"
      }`}
      onClick={() => onChange(!enabled)}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{slotIcon}</span>
        <div
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            enabled
              ? "bg-green-500 text-white"
              : "bg-gray-400 text-white"
          }`}
        >
          {enabled ? "ON" : "OFF"}
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm capitalize">
        {slot.replace(/_/g, " ")}
      </h3>
    </div>
  );
}
