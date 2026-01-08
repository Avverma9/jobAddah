"use client";

import { useEffect, useState } from "react";
import JobDetailView from "./JobDetailView";
import { extractRecruitmentData } from "@/lib/post-helper";

function UpdatingLoader({
  text = "Ham aapke liye updated data de rahe hai...",
  countdown = 30,
}) {
  return (
    <div className="bg-white/95 border border-slate-200/80 shadow-2xl rounded-3xl px-8 py-10 w-[min(90vw,420px)] max-w-full text-center">
      <div className="mx-auto relative h-20 w-20 mb-6">
        <div className="h-full w-full rounded-full border-4 border-slate-200/70 border-t-slate-900 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-slate-900 tabular-nums">
            {Math.max(Number.isFinite(countdown) ? countdown : 0, 0)}
          </span>
        </div>
      </div>
      <p className="text-base font-semibold text-slate-900">{text}</p>
      <p className="mt-2 text-sm text-slate-500">Please wait...</p>
    </div>
  );
}

export default function JobDetailWrapper({
  initialData,
  canonicalPath,
  sourcePath,
  url,
  id,
}) {
  const [data, setData] = useState(initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!loading) {
      setCountdown(30);
      return undefined;
    }

    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const queryUrl = url || sourcePath;
    if (!queryUrl && !id) {
      setError("No URL or ID provided");
      setLoading(false);
      return undefined;
    }

    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (queryUrl) params.set("url", queryUrl);
        if (id) params.set("id", id);

        const res = await fetch(`/api/gov/post?${params.toString()}`);
        if (!mounted) return;

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }

        const json = await res.json();
        if (!json.success || !json.data) {
          throw new Error(json.error || "No data found");
        }

        const extractedData = extractRecruitmentData(
          json.data?.data || json.data || {}
        );
        setData(extractedData);
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load job details");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [url, id, sourcePath]);

  if (!data) {
    if (loading) {
      return (
        <div className="min-h-[70vh] w-full flex items-center justify-center bg-linear-to-b from-slate-50 to-slate-100">
          <UpdatingLoader countdown={countdown} />
        </div>
      );
    }

    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-100">
        <div className="bg-white border border-red-200 shadow-sm rounded-md p-6 w-full max-w-md text-center">
          <p className="text-sm font-semibold text-red-800">
            Error loading job details
          </p>
          <p className="mt-1 text-xs text-red-600">
            {error || "Unknown error"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      <JobDetailView
        data={data}
        canonicalPath={canonicalPath}
        sourcePath={sourcePath}
      />
      {loading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/25 backdrop-blur-sm">
          <UpdatingLoader
            text="Ham aapke liye updated data de rahe hai..."
            countdown={countdown}
          />
        </div>
      )}
    </div>
  );
}
