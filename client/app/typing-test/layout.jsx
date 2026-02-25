import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Typing Speed Test for Exam Practice",
  description:
    "Practice typing speed with timer, accuracy tracking, and category-based exercises for exam and daily keyboard practice.",
  path: "/typing-test",
  type: "WebPage",
  keywords: ["typing test", "typing speed test", "typing accuracy practice"],
});

export default function TypingTestLayout({ children }) {
  return children;
}
