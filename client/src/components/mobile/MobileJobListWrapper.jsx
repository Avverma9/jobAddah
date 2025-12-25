"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
const MobileJobList = dynamic(() => import("@/components/mobile/JobList"), { ssr: false });

export default function MobileJobListWrapper() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function fetchSections() {
      setLoading(true);
      try {
        const res = await fetch('/api/gov/sections-with-posts', { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const raw = Array.isArray(json.data) ? json.data : [];

        // Build mobile sections from each category so tabs show category names (Latest, Admit Card, etc.)
        const mobile = [];
        raw.forEach((sec) => {
          (sec.categories || []).forEach((cat) => {
            const jobs = [];
            (cat.data || []).forEach((post) => {
              if (Array.isArray(post.jobs)) {
                post.jobs.forEach((j) => {
                  if (j && j.title) {
                    jobs.push({
                      title: j.title,
                      link: j.link || j.url || post.url,
                      createdAt: j.createdAt || j.date || post.createdAt || null,
                      id: j.id || j._id || null,
                    });
                  }
                });
              } else if (post.title) {
                jobs.push({
                  title: post.title,
                  link: post.url || post.link,
                  createdAt: post.createdAt || post.date || null,
                  id: post._id || post.id || null,
                });
              }
            });

            // dedupe by title
            const unique = jobs.filter((j, i, arr) => i === arr.findIndex((t) => t.title === j.title));

            mobile.push({
              name: cat.name || cat.title || sec.url || "Section",
              jobs: unique,
            });
          });
        });

        setSections(mobile);
      } catch (err) {
        if (err.name !== 'AbortError' && mounted) setError(err.message || 'Failed to fetch');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSections();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  return <MobileJobList sections={sections} loading={loading} />;
}
