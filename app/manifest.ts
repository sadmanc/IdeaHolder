import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IdeaHolder",
    short_name: "Ideas",
    description: "Your personal idea bucket.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#0f0f0f",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
