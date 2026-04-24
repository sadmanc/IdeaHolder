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
      { src: "/icon/tab", sizes: "32x32", type: "image/png" },
      {
        src: "/icon/android",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/android-large",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
