import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FloatingControls from "@/components/FloatingControls";

describe("FloatingControls", () => {
  const handlers = { onRotate: vi.fn(), onFlip: vi.fn(), onCancel: vi.fn() };

  it("renders nothing when no piece is active", () => {
    const { container } = render(
      <FloatingControls activeId={null} {...handlers} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders buttons when a piece is active", () => {
    render(<FloatingControls activeId="A" {...handlers} />);
    expect(screen.getByText(/Rotate/)).toBeInTheDocument();
    expect(screen.getByText(/Flip/)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/)).toBeInTheDocument();
  });

  it("calls onRotate when Rotate is clicked", () => {
    const onRotate = vi.fn();
    render(<FloatingControls activeId="A" {...handlers} onRotate={onRotate} />);
    fireEvent.click(screen.getByText(/Rotate/));
    expect(onRotate).toHaveBeenCalledOnce();
  });

  it("calls onFlip when Flip is clicked", () => {
    const onFlip = vi.fn();
    render(<FloatingControls activeId="B" {...handlers} onFlip={onFlip} />);
    fireEvent.click(screen.getByText(/Flip/));
    expect(onFlip).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Cancel is clicked", () => {
    const onCancel = vi.fn();
    render(<FloatingControls activeId="C" {...handlers} onCancel={onCancel} />);
    fireEvent.click(screen.getByText(/Cancel/));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
