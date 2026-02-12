"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";

const CONSENT_COOKIE = "adsense_consent";
const CONSENT_GRANTED = "granted";
const CONSENT_DENIED = "denied";
const CONSENT_MAX_AGE_DAYS = 180;

function readConsentCookie() {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) {
    return null;
  }

  const value = match.split("=").slice(1).join("=");
  if (value === CONSENT_GRANTED || value === CONSENT_DENIED) {
    return value;
  }

  return null;
}

function writeConsentCookie(value) {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export default function CookieConsent({ adsenseClient }) {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!adsenseClient) {
      return;
    }

    const existingConsent = readConsentCookie();
    if (existingConsent) {
      setConsent(existingConsent);
      setShowBanner(false);
      return;
    }

    setShowBanner(true);
  }, [adsenseClient]);

  const handleAccept = () => {
    writeConsentCookie(CONSENT_GRANTED);
    setConsent(CONSENT_GRANTED);
    setShowBanner(false);
  };

  const handleReject = () => {
    writeConsentCookie(CONSENT_DENIED);
    setConsent(CONSENT_DENIED);
    setShowBanner(false);
  };

  return (
    <>
      {adsenseClient && consent === CONSENT_GRANTED ? (
        <Script
          id="adsense-script"
          async
          strategy="afterInteractive"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
        />
      ) : null}

      {adsenseClient && showBanner ? (
        <div className="fixed inset-x-4 bottom-4 z-[60] max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2 text-sm text-slate-700">
              <p className="text-base font-semibold text-slate-900">
                We use cookies to show relevant ads
              </p>
              <p>
                Google AdSense may use cookies to personalize ads and measure
                performance. You can accept or decline non-essential cookies.
              </p>
              <Link
                href="/privacy-policy"
                className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                Read our privacy policy
              </Link>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={handleReject}
                className="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 sm:w-auto"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={handleAccept}
                className="w-full rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-blue-800 sm:w-auto"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
