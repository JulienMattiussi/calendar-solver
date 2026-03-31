"use client";

import { BOARD_OUTER_WIDTH } from "@/lib/board";

interface ControlPanelProps {
  activeId: string | null;
  onRotate: () => void;
  onFlip: () => void;
  onCancel: () => void;
  style?: React.CSSProperties;
}

const HOW_TO_PLAY_DESKTOP = [
  { icon: "①", label: "Select", sub: "a piece from the tray" },
  { icon: "②", label: "Hover", sub: "to preview · click to place" },
  { icon: "③", label: "Right-click", sub: "a placed piece to remove" },
];

export default function ControlPanel({
  activeId,
  onRotate,
  onFlip,
  onCancel,
  style,
}: ControlPanelProps) {
  const transforms = [
    { label: "Rotate 90°", icon: "↻", key: "R", action: onRotate },
    { label: "Flip", icon: "⇄", key: "F", action: onFlip },
    { label: "Cancel", icon: "✕", key: "Esc", action: onCancel },
  ];

  return (
    <div
      className="flex flex-col md:flex-row"
      style={{
        width: BOARD_OUTER_WIDTH,
        background: "linear-gradient(135deg, #fdf8f0 0%, #f5ead8 100%)",
        border: "1.5px solid rgba(139,105,20,0.22)",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(100,70,10,0.08)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* How to play */}
      <div className="flex flex-col gap-1.5 p-2 md:p-5" style={{ flex: 1 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#a07830",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          How to play
        </p>
        {/* Mobile: compact single line */}
        <p
          className="md:hidden"
          style={{ fontSize: 11, color: "#7a5c20", margin: 0, lineHeight: 1.6 }}
        >
          <span style={{ color: "#c8972a", fontWeight: 700 }}>①</span> Tap to
          select · tap again to rotate{"  "}
          <span style={{ color: "#c8972a", fontWeight: 700 }}>②</span> Drag to
          preview · tap to place{"  "}
          <span style={{ color: "#c8972a", fontWeight: 700 }}>③</span> Hold a
          piece to remove
        </p>
        {/* Desktop instructions */}
        <div className="hidden md:flex flex-col gap-2">
          {HOW_TO_PLAY_DESKTOP.map(({ icon, label, sub }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "baseline", gap: 8 }}
            >
              <span style={{ fontSize: 13, color: "#c8972a", flexShrink: 0 }}>
                {icon}
              </span>
              <span style={{ fontSize: 12, color: "#5c3d0a", fontWeight: 600 }}>
                {label}
              </span>
              <span style={{ fontSize: 11, color: "#a08050" }}>{sub}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider + Transform controls — desktop only (mobile uses FloatingControls) */}
      <div
        className="hidden md:block h-px md:h-auto md:w-px"
        style={{ background: "rgba(139,105,20,0.15)" }}
      />

      {/* Transform controls */}
      <div className="hidden md:flex flex-col gap-2.5 p-5">
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#a07830",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          Transform{" "}
          {activeId ? (
            <span style={{ color: "#c8972a" }}>· piece {activeId}</span>
          ) : null}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {transforms.map(({ label, icon, key, action }) => (
            <button
              key={key}
              onClick={action}
              disabled={!activeId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 9,
                border: "none",
                background: activeId ? "rgba(139,105,20,0.12)" : "transparent",
                cursor: activeId ? "pointer" : "default",
                opacity: activeId ? 1 : 0.35,
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  width: 22,
                  textAlign: "center",
                  color: "#8b6914",
                }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#5c3d0a",
                  flex: 1,
                }}
              >
                {label}
              </span>
              <kbd
                className="hidden md:inline-flex"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: 5,
                  background: activeId
                    ? "rgba(139,105,20,0.15)"
                    : "rgba(0,0,0,0.05)",
                  border: "1px solid rgba(139,105,20,0.25)",
                  color: "#7a5218",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {key}
              </kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
