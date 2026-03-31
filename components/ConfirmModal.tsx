"use client";

interface ConfirmModalProps {
  month:     string;
  day:       string;
  dow:       string;
  onConfirm: () => void;
  onCancel:  () => void;
}

export default function ConfirmModal({ month, day, dow, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(30,18,5,0.55)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #fdf8f0 0%, #f0e4c8 100%)",
          border: "2px solid rgba(139,105,20,0.3)",
          borderRadius: 20,
          boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
          padding: "32px 36px",
          maxWidth: 360,
          width: "90%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#3d2700", letterSpacing: "0.02em" }}>
          Solve the puzzle?
        </h2>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "#7a5218" }}>
          The app will find a solution for
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 16, fontWeight: 700, color: "#a07020" }}>
          {month} · {day} · {dow}
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 12, color: "#a08050" }}>
          Current piece placements will be cleared.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 600,
              background: "rgba(139,105,20,0.08)", border: "1.5px solid rgba(139,105,20,0.2)",
              color: "#7a5218", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "linear-gradient(135deg, #c8972a 0%, #a07020 100%)",
              border: "none", color: "#fff", cursor: "pointer",
              boxShadow: "0 2px 10px rgba(139,105,20,0.4)",
            }}
          >
            Solve it
          </button>
        </div>
      </div>
    </div>
  );
}
