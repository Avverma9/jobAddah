/**
 * Application constants
 */

// Search date priority order for highlighting
export const SEARCH_DATE_PRIORITY = [
  { key: "admitCardDate", label: "Admit Card" },
  { key: "examDate", label: "Exam" },
  { key: "applicationLastDate", label: "Last Date" },
  { key: "applicationStartDate", label: "Start Date" },
  { key: "notificationDate", label: "Notification" },
];

// Tool routes configuration
export const TOOLS_CONFIG = [
  { name: "PDF Tools", path: "/jobsaddah-pdf-tools", icon: "FileText" },
  { name: "Image Resize", path: "/jobsaddah-image-tools", icon: "Image" },
  { name: "Resume Maker", path: "/jobsaddah-resume-tools", icon: "Award" },
  { name: "Typing Test", path: "/jobsaddah-typing-tools", icon: "Type" },
  { name: "Quiz App", path: "/jobsaddah-quiz-tools", icon: "Briefcase" },
];

// Bottom navigation items
export const BOTTOM_NAV_ITEMS = [
  { id: "govt", icon: "Building2", label: "Govt Job" },
  { id: "pvt", icon: "Briefcase", label: "Pvt Job" },
  { id: "tools", icon: "Wrench", label: "Tools" },
  { id: "deadlines", icon: "Clock", label: "Deadlines" },
];

// Section tab icons mapping
export const SECTION_TAB_ICONS = {
  "Latest Jobs": "Briefcase",
  "Admit Card": "Calendar",
  "Results": "Bell",
  "Syllabus": "Briefcase",
  "Answer Key": "Briefcase",
  "Admission": "Briefcase",
};

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 640;

// API polling intervals (in milliseconds)
export const REMINDERS_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Search debounce delay
export const SEARCH_DEBOUNCE_DELAY = 500;

// Private jobs concurrent fetch workers
export const PRIVATE_JOBS_CONCURRENCY = 2;
