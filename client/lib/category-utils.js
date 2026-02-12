export const toCategoryKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeCategoryName = (value) =>
  String(value || "").replace(/\s+/g, " ").trim();

export const matchesCategory = (categoryName, queryValue) => {
  const normalizedName = normalizeCategoryName(categoryName);
  const normalizedQuery = normalizeCategoryName(queryValue);
  if (!normalizedName || !normalizedQuery) return false;
  if (normalizedName.toLowerCase() === normalizedQuery.toLowerCase()) return true;
  return toCategoryKey(normalizedName) === toCategoryKey(normalizedQuery);
};
