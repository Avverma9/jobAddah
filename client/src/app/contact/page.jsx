// src/pages/ContactUs.jsx
import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import SEO from "@/lib/SEO";
import AdBanner728x90 from "@/lib/ads/Adsetra728x90";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SEO
        title="Contact Us | JobsAddah - Get in Touch"
        description="Contact JobsAddah for any queries about government jobs, sarkari result, admit cards, or exam results. We're here to help you with your career journey."
        keywords="contact jobsaddah, sarkari result help, govt job query, career support, job portal contact"
        canonical="/contact-us"
        section="Contact"
      />
      <div className="hidden md:flex justify-center w-full my-4">
  <AdBanner728x90 />
</div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "contact@jobsaddah.com",
              desc: "Send us an email anytime",
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+91-XXXX-XXXX-XX",
              desc: "Monday - Friday, 9AM - 6PM IST",
            },
            {
              icon: MapPin,
              title: "Address",
              value: "India",
              desc: "Based in India, serving nationwide",
            },
          ].map((contact, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-xl border border-slate-200 hover:shadow-lg transition-shadow text-center"
            >
              <contact.icon className="text-blue-600 mx-auto mb-4" size={32} />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {contact.title}
              </h3>
              <p className="font-medium text-slate-700 mb-2">{contact.value}</p>
              <p className="text-sm text-slate-500">{contact.desc}</p>
            </div>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What should I do if I found an error in a job listing?",
                a: "Please contact us immediately via email with the job details and the error found. We'll verify and correct it.",
              },
              {
                q: "Can I post a job on Jobsaddah?",
                a: "Yes, recruiters and organizations can reach out to us for partnership and job posting opportunities.",
              },
              {
                q: "How often are job listings updated?",
                a: "We update our listings multiple times daily to ensure you get the latest opportunities.",
              },
              {
                q: "Is there a registration fee?",
                a: "No, Jobsaddah is completely free for job seekers. No hidden charges or registration fees.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-6"
              >
                <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-700">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
