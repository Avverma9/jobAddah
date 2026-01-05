// Small text utilities
export function toTitleCase(str) {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

const textUtils = { toTitleCase };

export default textUtils;