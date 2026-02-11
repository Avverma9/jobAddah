import Link from "next/link";
import { blogPosts } from "@/lib/blog-posts";

export const metadata = {
  title: "Blog | JobsAddah",
  description: "Latest updates, preparation tips, and career articles for job seekers.",
};

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Blog
          </h1>
          <p className="text-slate-600 mt-2 max-w-2xl">
            News, tips, and guides to keep you ready for exams, applications, and
            recruitment updates.
          </p>

          {/* Search + Filters UI (static) */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <span className="text-slate-400">🔎</span>
                <input
                  placeholder="Search posts (title, category, keywords)..."
                  className="w-full text-sm outline-none text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none">
                <option>All Categories</option>
                <option>Planning</option>
                <option>Strategy</option>
                <option>Applications</option>
                <option>Eligibility</option>
                <option>Exam Day</option>
                <option>Results</option>
                <option>Preparation</option>
                <option>Career</option>
                <option>DV & Interview</option>
                <option>Mindset</option>
              </select>

              <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none">
                <option>Newest</option>
                <option>Most Helpful</option>
                <option>Category A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-4">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-start gap-4">
                {/* Left badge/icon */}
                <div className="shrink-0">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 text-lg">
                    📝
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {post.category}
                    </span>
                    {post?.tags?.slice(0, 3)?.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-2 text-lg md:text-xl font-bold text-slate-900 group-hover:underline">
                    {post.title}
                  </h2>

                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {post.desc}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Read full guide →
                    </span>

                    <span className="text-xs text-slate-500">
                      {post?.tags?.length ? `${post.tags.length} tags` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-10 text-center text-sm text-slate-500">
          More posts coming soon. Keep checking for updates.
        </div>
      </div>
    </div>
  );
}
