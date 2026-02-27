import PortalApp from "./component/PortalApp";
import { buildPageMetadata } from "./lib/seo";

export const metadata = buildPageMetadata({
  title: "JobsAddah - Home",
  description:
    "Jobs, results, admit cards aur admissions ki latest updates. Real-time search ke saath fresh alerts dekhein.",
  path: "/",
  keywords: [
    "latest sarkari jobs 2026",
    "new govt job vacancies",
    "sarkari college admissions 2026",
    "sarkari exam results 2026",
    "admit card download online",
    "jee mains session 2 online form 2026",
    "nta cuet ug 2026 apply online",
    "nta cuet pg 2026 notification",
    "up polytechnic jeecup online form 2026",
    "ctet february 2026 application form",
    "bcece online mop up counselling 2025",
    "updeled 2024 online counseling",

    "railway rrb alp revised exam date 2026",
    "rrb ntpc graduate level admit card 2026",
    "railway rrb technician exam date 2026",
    "rrb junior engineer je application status",
    "rrb paramedical staff exam date 2026",

    "ssc exam calendar 2026-27 download",
    "ssc stenographer skill test exam city",
    "ssc junior engineer je option form",
    "upsc civil services ias 2026 online form",
    "upsc nda na 1 exam date 2026",
    "upsc cds 1 exam date 2026",

    "up police si exam date 2025 2026",
    "up police si asi typing test date",
    "bpsc 71th mains exam date 2026",
    "bpsc 70th interview letter download",
    "bihar police driver pet exam date",
    "bpssc bihar police enforcement exam",
    "jharkhand jssc anm recruitment 2025",

    "bihar board 10th 12th time table 2026",
    "cbse board 10th 12th exam date sheet 2026",
    "haryana hbse board 10th 12th time table",
    "rbse class 10th 12th time table 2026"
  ],
});

export default function Home() {
  return <PortalApp />;
}
