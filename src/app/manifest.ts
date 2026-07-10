import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lolo & Lili",
    short_name: "Lolo & Lili",
    // Default locale is fr — ship the French description.
    description: "Notre petit chez-nous — statuts, tâches et humeurs à deux 💕",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff7f0",
    theme_color: "#fff7f0",
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      // Raster icons for platforms that don't accept SVG (notably iOS).
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      // Raster maskable so launchers that ignore SVG don't fall back to the
      // non-maskable PNG and draw a white box (report 03 §3).
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
