import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Free Resume Maker with ATS-Friendly Templates",
  description:
    "Create and download a professional resume with ATS-friendly templates for government and private job applications.",
  path: "/resume-maker",
  type: "WebPage",
  keywords: ["resume maker", "free resume builder", "ats friendly resume template"],
});

export default function ResumeMakerLayout({ children }) {
  return children;
}
