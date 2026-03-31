"use client";

import { BOARD_OUTER_WIDTH } from "@/lib/board";

interface ControlPanelProps {
  activeId: string | null;
  onRotate: () => void;
  onFlip:   () => void;
  onCancel: () => void;
}

const HOW_TO_PLAY = [
  { icon: "①", label: "Click a piece",      sub: "in the tray to select it" },
  { icon: "②", label: "Click the board",    sub: "to place it — green = valid" },
  { icon: "③", label: "Right-click a piece", sub: "on the board to remove it" },
];

export default function ControlPanel({ activeId, onRotate, onFlip, onCancel }: ControlPanelProps) {
  const transforms = [
    { label: "Rotate 90°", icon: "↻", key: "R",   action: onRotate },
    { label: "Flip",       icon: "⇄", key: "F",   action: onFlip   },
    { label: "Cancel",     icon: "✕", key: "Esc", action: onCancel },
  ];

  return (
    <div style={{
      display: "flex", gap: 0, alignItems: "stretch",
      width: BOARD_OUTER_WIDTH,
      background: "linear-gradient(135deg, #fdf8f0 0%, #f5ead8 100%)",
      border: "1.5px solid rgba(139,105,20,0.22)",
      borderRadius: 16,
      boxShadow: "0 2px 12px rgba(100,70,10,0.08)",
      overflow: "hidden",
    }}>
      {/* Left: how to play */}
      <div style={{ flex: 1, padding: "14px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#a07830", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          How to play
        </p>
        {HOW_TO_PLAY.map(({ icon, label, sub }) => (
          <div key={label} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#c8972a", flexShrink: 0 }}>{icon}</span>
            <span style={{ fontSize: 12, color: "#5c3d0a", fontWeight: 600 }}>{label}</span>
            <span style={{ fontSize: 11, color: "#a08050" }}>{sub}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "rgba(139,105,20,0.15)", margin: "12px 0" }} />

      {/* Right: transform controls */}
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#a07830", letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
          Transform {activeId ? <span style={{ color: "#c8972a" }}>· piece {activeId}</span> : null}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {transforms.map(({ label, icon, key, action }) => (
            <button key={key} onClick={action} disabled={!activeId}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: 9, border: "none",
                background: activeId ? "rgba(139,105,20,0.12)" : "transparent",
                cursor: activeId ? "pointer" : "default",
                opacity: activeId ? 1 : 0.35,
                transition: "all 0.15s",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 16, width: 22, textAlign: "center", color: "#8b6914" }}>{icon}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#5c3d0a", flex: 1 }}>{label}</span>
              <kbd style={{
                fontSize: 10, fontWeight: 700,
                padding: "2px 6px", borderRadius: 5,
                background: activeId ? "rgba(139,105,20,0.15)" : "rgba(0,0,0,0.05)",
                border: "1px solid rgba(139,105,20,0.25)",
                color: "#7a5218", fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}>{key}</kbd>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
