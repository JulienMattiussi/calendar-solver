import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "@/components/ConfirmModal";

describe("ConfirmModal", () => {
  const defaults = {
    month: "Mar",
    day: "31",
    dow: "Tue",
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it("displays the date", () => {
    render(<ConfirmModal {...defaults} />);
    expect(screen.getByText(/Mar · 31 · Tue/)).toBeInTheDocument();
  });

  it("calls onConfirm when 'Solve it' is clicked", () => {
    const onConfirm = vi.fn();
    render(<ConfirmModal {...defaults} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText("Solve it"));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when 'Cancel' button is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaults} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("calls onCancel when backdrop is clicked", () => {
    const onCancel = vi.fn();
    const { container } = render(
      <ConfirmModal {...defaults} onCancel={onCancel} />,
    );
    // The backdrop is the outermost div
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("does not call onCancel when dialog content is clicked", () => {
    const onCancel = vi.fn();
    render(<ConfirmModal {...defaults} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Solve the puzzle?"));
    expect(onCancel).not.toHaveBeenCalled();
  });
});
