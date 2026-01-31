import SearchClient from "./SearchClient";

export const metadata = {
  title: "Search Jobs | JobsAddah",
  description:
    "Search JobsAddah for the latest Sarkari results, admit cards, and government job notifications.",
  robots: "noindex,follow",
};

export default function SearchPage() {
  return <SearchClient />;
}
