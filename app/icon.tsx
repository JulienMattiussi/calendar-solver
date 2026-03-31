import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Four coloured puzzle-piece cells on a wooden board
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 7,
        background: "linear-gradient(135deg, #e8d5a3 0%, #c9a84c 100%)",
        border: "2px solid #8b6914",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#D45C50",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#38A8B0",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#9858C8",
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: "#52A86B",
            }}
          />
        </div>
      </div>
    </div>,
    { ...size },
  );
}
