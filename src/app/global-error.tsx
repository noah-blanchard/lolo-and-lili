"use client";

import { useEffect } from "react";

// Last-resort boundary: replaces the root layout when it (or the html shell)
// throws. It must render its own <html>/<body>, and next-intl / Tailwind are not
// guaranteed here — so keep it minimal, bilingual (fr + zh), and inline-styled.
export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
}) {
  const retry = unstable_retry ?? reset;

  useEffect(() => {
    console.error("[global] boundary caught:", error);
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          background: "#fff7f0",
          color: "#4a3f3a",
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "22rem" }}>
          <div style={{ fontSize: "3rem" }}>🩹</div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, margin: "0.75rem 0 0.25rem" }}>
            Oups, un petit couac 💔
          </h1>
          <p style={{ fontSize: "0.9rem", opacity: 0.75, margin: "0 0 0.25rem" }}>
            Quelque chose s&apos;est mal passé. On peut réessayer.
          </p>
          <p style={{ fontSize: "0.9rem", opacity: 0.75, margin: "0 0 1.25rem" }}>
            出了点小状况，请再试一次。
          </p>
          <button
            type="button"
            onClick={() => retry?.()}
            style={{
              border: "none",
              borderRadius: "9999px",
              padding: "0.75rem 1.75rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#fff",
              background: "#f4978e",
              cursor: "pointer",
            }}
          >
            Réessayer · 重试
          </button>
        </div>
      </body>
    </html>
  );
}
