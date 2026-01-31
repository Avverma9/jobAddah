import React from 'react';
import { Shield, Lock, Eye, Server, Cookie, Globe, Mail } from 'lucide-react';
import SEO from "@/lib/SEO";

const PrivacyPolicy = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-700">
      <SEO 
        title="Privacy Policy | JobsAddah - Data Protection & Cookie Policy"
        description="Read the Privacy Policy of JobsAddah. Understand how we handle your data, use cookies for AdSense, and protect your privacy while you search for Sarkari Naukri."
      />
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header Section --- */}
        <div className="bg-white rounded-t-2xl shadow-sm border border-gray-100 p-8 sm:p-12 border-b-4 border-blue-600">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
              <p className="text-gray-500 mt-1">Effective Date: January 20, {currentYear}</p>
            </div>
          </div>
          <p className="text-lg text-gray-600 leading-relaxed">
            At <strong>JobsAddah</strong>, accessible from https://jobsaddah.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by JobsAddah and how we use it.
          </p>
        </div>

        {/* --- Main Content --- */}
        <div className="bg-white rounded-b-2xl shadow-sm border border-gray-100 p-8 sm:p-12 space-y-10">

          {/* 1. Log Files */}
          <section className="flex gap-4">
            <div className="shrink-0 mt-1 hidden sm:block">
              <Server className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Log Files</h2>
              <p className="text-gray-600 leading-relaxed">
                JobsAddah follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services&apos; analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information.
              </p>
            </div>
          </section>

          {/* 2. Cookies and Web Beacons */}
          <section className="flex gap-4">
            <div className="shrink-0 mt-1 hidden sm:block">
              <Cookie className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cookies and Web Beacons</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Like any other website, JobsAddah uses &quot;cookies&quot;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
              </p>
            </div>
          </section>

          {/* 3. Google DoubleClick DART Cookie (Vital for AdSense) */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              3. Google DoubleClick DART Cookie
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.jobsaddah.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL - <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow noreferrer" className="text-blue-600 underline hover:text-blue-800">https://policies.google.com/technologies/ads</a>
            </p>
          </section>

          {/* 4. Advertising Partners */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Our Advertising Partners</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Google: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="nofollow noreferrer" className="text-blue-600 hover:underline">https://policies.google.com/technologies/ads</a></li>
            </ul>
          </section>

          {/* 5. CCPA & GDPR */}
          <section className="flex gap-4">
            <div className="shrink-0 mt-1 hidden sm:block">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. CCPA & GDPR Data Protection Rights</h2>
              <p className="text-gray-600 leading-relaxed mb-3">
                We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600 text-sm">
                <li><strong>The right to access</strong> - You have the right to request copies of your personal data.</li>
                <li><strong>The right to rectification</strong> - You have the right to request that we correct any information you believe is inaccurate.</li>
                <li><strong>The right to erasure</strong> - You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong>The right to restrict processing</strong> - You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
              </ul>
            </div>
          </section>

          {/* 6. Children's Information */}
          <section className="flex gap-4">
            <div className="shrink-0 mt-1 hidden sm:block">
              <Eye className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Children&apos;s Information</h2>
              <p className="text-gray-600 leading-relaxed">
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
                JobsAddah does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
              </p>
            </div>
          </section>

          {/* 7. Contact Information */}
          <section className="border-t border-gray-200 pt-8 mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">7. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about our Privacy Policy, do not hesitate to contact us.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 bg-gray-50 rounded-xl p-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Mailing Address:</h3>
                <address className="text-gray-600 not-italic text-sm leading-relaxed">
                  JobsAddah Legal Team<br />
                  Bakhtiyarpur, Patna<br />
                  Bihar, India - 803212
                </address>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Digital Contact:</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> support@jobsaddah.com
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold">Phone:</span> +91-9153630507
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;