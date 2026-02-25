import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Mock Test Practice for Government Exams",
  description:
    "Practice government exam mock tests with timed sessions, section-wise analysis, and score improvement insights.",
  path: "/mock-test",
  type: "WebPage",
  keywords: ["jobsaddah mock test", "government exam mock test", "online practice test"],
});

export default function MockTestLayout({ children }) {
  return children;
}
