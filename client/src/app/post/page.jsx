import { loadJobDetail } from "@/lib/job-detail-loader";
import { notFound, redirect } from "next/navigation";

function renderDates(dates = {}) {
  return Object.entries(dates).map(([k, v]) => {
    if (!v) return null;
    return (
      <div key={k} className="mb-1">
        <strong>{k.replace(/([A-Z])/g, " $1")}: </strong>
        <span>{v}</span>
      </div>
    );
  });
}

export default async function PostPage({ searchParams = {} }) {
  const url = searchParams?.url || null;
  const id = searchParams?.id || null;

  if (!url && !id) return notFound();

  // Try scraper endpoint which now returns the full post document
  try {
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/scrapper/scrape-complete`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, id }),
        cache: "no-store",
      },
    );

    const json = await resp.json().catch(() => null);

    if (json && json.success && json.data) {
      const doc = json.data;
      const r = doc.recruitment || {};

      return (
        <main className="container mx-auto p-6">
          <h1 className="text-2xl font-bold mb-2">{r.title || "Untitled"}</h1>
          <p className="text-sm text-gray-600 mb-4">{r.organization?.name}</p>

          <section className="mb-4">
            <h2 className="font-semibold">Important Dates</h2>
            {renderDates(r.importantDates)}
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">Vacancy</h2>
            <div>Total Posts: {r.vacancyDetails?.totalPosts ?? "N/A"}</div>
            {Array.isArray(r.vacancyDetails?.positions) && (
              <ul className="list-disc ml-6">
                {r.vacancyDetails.positions.map((p, i) => (
                  <li key={i}>
                    {p.name} — {p.posts}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mb-4">
            <h2 className="font-semibold">Vacancy (Additional)</h2>
            <div>Total Posts: {r.additionalDetails?.totalPosts ?? "N/A"}</div>
            {Array.isArray(r.additionalDetails?.positions) && (
              <ul className="list-disc ml-6">
                {r.additionalDetails.positions.map((p, i) => (
                  <li key={i}>
                    {p.name} — {p.posts}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="mb-4">
            <h2 className="font-semibold">Application Fee</h2>
            {r.applicationFee && typeof r.applicationFee === "object" ? (
              <ul className="ml-4">
                {Object.entries(r.applicationFee).map(([k, v]) => (
                  <li key={k}>
                    <strong>{k}:</strong> {Array.isArray(v) ? v.join(", ") : v}
                  </li>
                ))}
              </ul>
            ) : (
              <div>N/A</div>
            )}
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">Eligibility</h2>
            <div>{r.eligibility?.educationalQualification || "N/A"}</div>
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">Selection Process</h2>
            {Array.isArray(r.selectionProcess) ? (
              <ul className="list-disc ml-6">
                {r.selectionProcess.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <div>N/A</div>
            )}
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">Important Links</h2>
            <ul className="ml-4">
              {r.importantLinks &&
                Object.entries(r.importantLinks).map(([k, obj]) =>
                  obj?.link ? (
                    <li key={k}>
                      <a
                        href={obj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600"
                      >
                        {obj.text || k}
                      </a>
                    </li>
                  ) : null,
                )}
            </ul>
          </section>

          <section className="mb-4">
            <h2 className="font-semibold">Additional Details</h2>
            {r.additionalDetails ? (
              <div className="border border-slate-300 rounded-sm p-4 bg-amber-50">
                {r.additionalDetails.advertisementNumber && (
                  <div className="mb-2">
                    <strong>Advertisement No:</strong> {r.additionalDetails.advertisementNumber}
                  </div>
                )}

                {r.additionalDetails.noteToCandidates && (
                  <div className="mb-2 text-sm text-slate-700">
                    {r.additionalDetails.noteToCandidates}
                  </div>
                )}

                {r.additionalDetails.confirmationAdvice && (
                  <div className="mb-2 text-sm text-slate-700">
                    <strong>Confirmation Advice:</strong> {r.additionalDetails.confirmationAdvice}
                  </div>
                )}

                {r.additionalDetails.sourceUrl && (
                  <div className="mt-2">
                    <a
                      href={r.additionalDetails.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600"
                    >
                      Source
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div>N/A</div>
            )}
          </section>
        </main>
      );
    }
  } catch (e) {
    // continue to fallback
  }

  // Fallback to previous behaviour: load canonical path and redirect
  const result = await loadJobDetail({ url, id });
  if (!result?.canonicalPath) return notFound();
  redirect(result.canonicalPath);
}
