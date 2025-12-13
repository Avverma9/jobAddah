// src/pages/ContactUs.jsx
import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import AdBanner from "../components/ads/AdBanner";
import AdRectangle from "../components/ads/AdRectangle";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill all fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Replace with your actual backend endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Message sent successfully! We'll get back to you soon.");
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Error sending message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-blue-100">
            Have questions or feedback? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Top Banner Ad */}
        <AdBanner position="top" className="mb-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Contact Info Cards */}
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

        {/* Rectangle Ad */}
        <AdRectangle position="contact" className="my-8" />

        {/* Contact Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Get in Touch</h2>
          <p className="text-slate-600 mb-8">
            Fill out the form below and we'll respond as soon as possible.
          </p>

          {submitted ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-green-900 mb-2">
                Thank You!
              </h3>
              <p className="text-green-800">
                Your message has been sent successfully. We'll get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows="6"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={20} />
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>

        {/* Rectangle Ad */}
        <AdRectangle position="contact" className="my-8" />

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "What should I do if I found an error in a job listing?",
                a: "Please contact us immediately with the job details and the error found. We'll verify and correct it.",
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
