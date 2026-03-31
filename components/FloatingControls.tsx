"use client";

interface FloatingControlsProps {
  activeId: string | null;
  onRotate: () => void;
  onFlip: () => void;
  onCancel: () => void;
}

export default function FloatingControls({
  activeId,
  onRotate,
  onFlip,
  onCancel,
}: FloatingControlsProps) {
  if (!activeId) return null;

  return (
    <div
      className="flex md:hidden"
      style={{
        position: "absolute",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        gap: 8,
        background: "rgba(30,20,5,0.72)",
        backdropFilter: "blur(8px)",
        borderRadius: 999,
        padding: "6px 10px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
        pointerEvents: "auto",
      }}
    >
      {[
        { label: "↻ Rotate", action: onRotate },
        { label: "⇄ Flip", action: onFlip },
        { label: "✕ Cancel", action: onCancel },
      ].map(({ label, action }) => (
        <button
          key={label}
          onTouchEnd={(e) => {
            e.stopPropagation();
            action();
          }}
          onClick={action}
          style={{
            padding: "7px 14px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "transparent",
            color: "#f5e6c0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            letterSpacing: "0.02em",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
