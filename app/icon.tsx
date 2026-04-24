import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 46,
          fontWeight: 700,
          letterSpacing: -3,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        ih
      </div>
    ),
    size,
  );
}
