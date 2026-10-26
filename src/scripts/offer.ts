/**
 * العداد التنازلي للعرض. أي عنصر عليه data-offer بيختفي لما العرض يخلص،
 * وأي [data-countdown] بيتملي بالأيام والساعات والدقايق والثواني.
 * الإعدادات بتيجي من <html data-offer-end="...">.
 */
const endAttr = document.documentElement.dataset["offerEnd"];
const end = endAttr ? Date.parse(endAttr) : NaN;

export const offerActive = (): boolean => Number.isFinite(end) && Date.now() <= end;

function hideOffer(): void {
  document.querySelectorAll<HTMLElement>("[data-offer]").forEach((el) => (el.hidden = true));
  document.querySelectorAll<HTMLElement>("[data-no-offer]").forEach((el) => (el.hidden = false));
  document.dispatchEvent(new CustomEvent("atad:offer-ended"));
}

const pad = (n: number): string => String(n).padStart(2, "0");

function tick(): void {
  const left = end - Date.now();
  if (left <= 0) return hideOffer();
  const s = Math.floor(left / 1000);
  const parts = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  document.querySelectorAll<HTMLElement>("[data-countdown]").forEach((box) => {
    (Object.keys(parts) as (keyof typeof parts)[]).forEach((k) => {
      const el = box.querySelector<HTMLElement>(`[data-unit="${k}"]`);
      if (el) el.textContent = pad(parts[k]);
    });
  });
  window.setTimeout(tick, 1000 - (Date.now() % 1000));
}

if (offerActive()) {
  document.querySelectorAll<HTMLElement>("[data-offer]").forEach((el) => (el.hidden = false));
  tick();
} else {
  hideOffer();
}
