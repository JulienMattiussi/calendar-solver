import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PieceTray from "@/components/PieceTray";
import { PIECES } from "@/lib/pieces";

const base = {
  placements: [],
  activeId: null,
  solving: false,
  rotation: 0 as const,
  flipped: false,
  canUndo: false,
  canRedo: false,
  onSelectPiece: vi.fn(),
  onRotate: vi.fn(),
  onFlip: vi.fn(),
  onCancel: vi.fn(),
  onUndo: vi.fn(),
  onRedo: vi.fn(),
  onReset: vi.fn(),
  onSolve: vi.fn(),
};

describe("PieceTray", () => {
  it("shows piece count 0/10 when nothing is placed", () => {
    render(<PieceTray {...base} />);
    expect(screen.getByText(/0\/10/i)).toBeInTheDocument();
  });

  it("updates count when pieces are placed", () => {
    render(
      <PieceTray
        {...base}
        placements={[{ pieceId: "A", row: 0, col: 0, rot: 0, flipped: false }]}
      />,
    );
    expect(screen.getByText(/1\/10/i)).toBeInTheDocument();
  });

  it("calls onSelectPiece with piece id when unplaced piece is clicked", () => {
    const onSelectPiece = vi.fn();
    render(<PieceTray {...base} onSelectPiece={onSelectPiece} />);
    fireEvent.click(screen.getByTitle(`Select piece A`));
    expect(onSelectPiece).toHaveBeenCalledWith("A");
  });

  it("calls onRotate (not onSelectPiece) when active piece is clicked again", () => {
    const onSelectPiece = vi.fn();
    const onRotate = vi.fn();
    render(
      <PieceTray
        {...base}
        activeId="A"
        onSelectPiece={onSelectPiece}
        onRotate={onRotate}
      />,
    );
    fireEvent.click(screen.getByTitle(`Select piece A`));
    expect(onRotate).toHaveBeenCalledOnce();
    expect(onSelectPiece).not.toHaveBeenCalled();
  });

  it("disables placed pieces", () => {
    render(
      <PieceTray
        {...base}
        placements={[{ pieceId: "B", row: 0, col: 0, rot: 0, flipped: false }]}
      />,
    );
    const btn = screen.getByTitle("Placed");
    expect(btn).toBeDisabled();
  });

  it("calls onReset when Reset all is clicked", () => {
    const onReset = vi.fn();
    render(<PieceTray {...base} onReset={onReset} />);
    fireEvent.click(screen.getByText("Reset"));
    expect(onReset).toHaveBeenCalledOnce();
  });

  it("calls onSolve when Solve is clicked", () => {
    const onSolve = vi.fn();
    render(<PieceTray {...base} onSolve={onSolve} />);
    fireEvent.click(screen.getByText(/Solve/));
    expect(onSolve).toHaveBeenCalledOnce();
  });

  it("disables Solve button while solving", () => {
    render(<PieceTray {...base} solving={true} />);
    expect(screen.getByText(/Solving/)).toBeDisabled();
  });

  it("renders all 10 pieces", () => {
    render(<PieceTray {...base} />);
    for (const p of PIECES) {
      expect(screen.getByTitle(`Select piece ${p.id}`)).toBeInTheDocument();
    }
  });
});
