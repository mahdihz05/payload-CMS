"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => { console.error("Public route error", error); }, [error]);
  return (
    <main className="internal-main">
      <section className="internal-hero state-page">
        <div className="container state-card">
          <span className="state-code">500</span>
          <h1>خطایی رخ داد · Something went wrong · حدث خطأ</h1>
          <p>دریافت محتوا موقتاً ممکن نیست. چند لحظه بعد دوباره تلاش کنید.</p>
          <button className="reference-button primary" type="button" onClick={() => retry()}>تلاش دوباره · Retry</button>
        </div>
      </section>
    </main>
  );
}
