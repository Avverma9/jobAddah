export const metadata = {
  title: "Blog | JobsAddah",
  description:
    "Latest updates, preparation tips, and career articles for job seekers.",
};

const posts = [
  {
    title: "How to Track Govt Job Deadlines",
    desc: "Build a simple checklist to avoid missing application dates.",
  },
  {
    title: "Top Mistakes in Online Applications",
    desc: "Common errors and how to fix them before submitting.",
  },
  {
    title: "Resume Basics for Govt Jobs",
    desc: "Keep your resume compliant with official requirements.",
  },
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-600 mt-2">
            News, tips, and guides to keep you ready for exams and recruitment.
          </p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.title}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-900 mb-2">
                {post.title}
              </h2>
              <p className="text-sm text-slate-600">{post.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
