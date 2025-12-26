export function initGtag(measurementId) {
  if (!measurementId) return;
  if (typeof window === 'undefined') return;
  if (window.gtagInitialized) return;
  window.gtagInitialized = true;

  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);} 
  window.gtag = gtag;
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
}

export function pageview(path) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path });
}

export function gtagEvent({ action, category, label, value }) {
  if (typeof window === 'undefined') return;
  if (!window.gtag) return;
  window.gtag('event', action, { event_category: category, event_label: label, value });
}
