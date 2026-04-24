import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f0f",
          color: "#fafaf9",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            letterSpacing: -8,
            lineHeight: 1,
          }}
        >
          ih
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 16,
            fontWeight: 500,
            letterSpacing: 2,
            opacity: 0.55,
            textTransform: "uppercase",
          }}
        >
          ideas
        </div>
      </div>
    ),
    size,
  );
}
