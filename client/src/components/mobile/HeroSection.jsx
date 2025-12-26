"use client";
import React from "react";
import Link from "next/link";

export const PrivateHeroSection = ({ categoryCount = 0 }) => {
  return (
    <section className="mt-4 px-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Private Jobs</h2>
            <p className="text-sm text-slate-500">{categoryCount} categories</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/private-jobs" className="text-sm font-semibold text-indigo-600">View All</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrivateHeroSection;
