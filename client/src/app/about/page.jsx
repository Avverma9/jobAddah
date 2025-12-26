// src/pages/AboutUs.jsx
import SEO from "@/lib/SEO";
import { Shield, Target, Users, Zap, BookOpen, TrendingUp } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="About Us | JobsAddah - India's Leading Sarkari Result Portal"
        description="JobsAddah is India's trusted sarkari result portal providing latest government job notifications, admit cards, exam results, and career guidance for job seekers across India."
        keywords="about jobsaddah, sarkari result portal, government job portal india, job notification website, career guidance, employment portal"
        canonical="/about-us"
        section="About Us"
      />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Jobsaddah</h1>
          <p className="text-xl text-blue-100">
            Empowering careers through quality job listings and valuable resources for freshers and professionals
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 space-y-12">
     
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Target className="text-blue-600" size={32} />
            Our Mission
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            At Jobsaddah, our mission is to bridge the gap between talented professionals and career opportunities. We believe that everyone deserves access to quality job listings, placement updates, and career guidance materials. Our platform aggregates the latest job openings from top companies, government sectors, and organizations across India, making it easier for job seekers to find their perfect match.
          </p>
        </section>

        {/* Vision Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
            <Zap className="text-amber-600" size={32} />
            Our Vision
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            To become India's most trusted platform for job seekers, providing real-time updates on placement drives, off-campus recruitment, government exams, and career resources. We aim to empower millions with information and opportunities to advance their careers.
          </p>
        </section>

     

        {/* Why Choose Us */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Why Choose Jobsaddah?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Latest Updates",
                description: "Real-time job listings and placement drive notifications",
              },
              {
                icon: Users,
                title: "Fresher Focused",
                description: "Specially curated for freshers and entry-level professionals",
              },
              {
                icon: BookOpen,
                title: "Resources",
                description: "Interview tips, resume guides, and placement papers",
              },
              {
                icon: Shield,
                title: "Verified Jobs",
                description: "All job listings are verified from official sources",
              },
              {
                icon: Target,
                title: "Easy Navigation",
                description: "User-friendly interface for seamless browsing",
              },
              {
                icon: Zap,
                title: "Fast Updates",
                description: "Quick notifications for new opportunities",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <feature.icon className="text-blue-600 mb-4" size={28} />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What We Offer */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">What We Offer</h2>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-8 rounded-lg">
            <ul className="space-y-4 text-slate-700">
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Government Job Updates:</strong> Latest notifications for SSC, IBPS, Railway, and other government sectors
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Off-Campus Drives:</strong> Exclusive off-campus recruitment drives from leading IT and non-IT companies
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Walk-in Interviews:</strong> Same-day or urgent walk-in interview opportunities
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Career Resources:</strong> Interview questions, placement papers, resume templates, and preparation guides
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  <strong>Internship Opportunities:</strong> Curated internship listings for skill development
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Target Audience */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "Engineering Freshers", desc: "B.E/B.Tech graduates looking for their first job" },
              { title: "MBA Graduates", desc: "Fresh MBA holders seeking management positions" },
              { title: "Government Exam Aspirants", desc: "Candidates preparing for SSC, Bank, Railways" },
              { title: "Early-Career Professionals", desc: "Professionals with 0-3 years of experience" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200"
              >
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

     
        <section className="bg-amber-50 border border-amber-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Important Disclaimer</h2>
          <p className="text-amber-900 leading-relaxed">
            Jobsaddah is an information aggregator platform. We collect and share job listings from various public sources including company websites, job portals, and official notifications. We do not directly recruit employees or act as an employment agency. All job listings are sourced from official channels, and candidates should verify information directly with the recruiting organization before applying.
          </p>
        </section>
      </div>
    </div>
  );
}
