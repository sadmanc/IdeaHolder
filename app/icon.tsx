import { ImageResponse } from "next/og";

export const contentType = "image/png";

export function generateImageMetadata() {
  return [
    { id: "tab", size: { width: 32, height: 32 } },
    { id: "android", size: { width: 192, height: 192 } },
    { id: "android-large", size: { width: 512, height: 512 } },
  ];
}

export default function Icon({ id }: { id: string }) {
  const px =
    id === "tab" ? 32 : id === "android" ? 192 : id === "android-large" ? 512 : 64;
  const fontSize = Math.round(px * 0.55);
  const radius = Math.round(px * 0.18);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "#fafaf9",
          fontSize,
          fontWeight: 700,
          letterSpacing: -Math.round(fontSize * 0.08),
          fontFamily: "system-ui, sans-serif",
          borderRadius: radius,
        }}
      >
        ih
      </div>
    ),
    { width: px, height: px },
  );
}
