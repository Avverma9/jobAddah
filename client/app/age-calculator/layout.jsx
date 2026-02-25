import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Age Calculator for Government Exam Eligibility",
  description:
    "Calculate exact age in years, months, and days for government exam eligibility, cutoff dates, and application checks.",
  path: "/age-calculator",
  type: "WebPage",
  keywords: ["age calculator", "government exam age calculator", "eligibility age check"],
});

export default function AgeCalculatorLayout({ children }) {
  return children;
}
