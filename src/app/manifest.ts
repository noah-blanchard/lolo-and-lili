import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lolo & Lili",
    short_name: "Lolo & Lili",
    //description: "Notre petit chez-nous — statuts, tâches et humeurs à deux 💕",
    description: "Our little home — statuses, tasks and moods for two 💕",
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
    ],
  };
}
