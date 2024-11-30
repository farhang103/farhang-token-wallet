import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import ConfirmModal from "../ConfirmModal";

beforeAll(() => {
  vi.mock("~/components/ui/dialog", () => ({
    Dialog: ({
      children,
      open,
      onOpenChange,
    }: {
      children: React.ReactNode;
      open: boolean;
      onOpenChange: (open: boolean) => void;
    }) =>
      open ? (
        <div
          data-testid="modal"
          onKeyDown={(e) => e.key === "Escape" && onOpenChange(false)}
        >
          {children}
        </div>
      ) : null,
    DialogContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogHeader: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    DialogTitle: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  }));

  vi.mock("~/components/ui/button", () => ({
    Button: ({ children, onClick, disabled }: any) => (
      <button onClick={onClick} disabled={disabled}>
        {children}
      </button>
    ),
  }));

  vi.mock("lucide-react", () => ({
    Loader2: () => <div>Loading</div>,
    CircleCheckBigIcon: () => <div>Success</div>,
  }));
});

describe("ConfirmModal", () => {
  const defaultProps = {
    openModal: true,
    setOpenModal: vi.fn(),
    amount: "100",
    toAddress: "0x1234567890123456789012345678901234567890",
    estimatedFeeUSD: 2.5,
    isSendPending: false,
    isTransactionPending: false,
    isTransactionSuccess: false,
    handleConfirm: vi.fn(),
  };

  it("handles all modal states correctly", () => {
    const { rerender } = render(<ConfirmModal {...defaultProps} />);

    // Initial state
    expect(screen.getByText("100 FAT")).toBeInTheDocument();
    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
    expect(screen.getByText("$2.50")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeEnabled();

    // Test transaction pending
    rerender(<ConfirmModal {...defaultProps} isTransactionPending={true} />);
    expect(button).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Test send pending
    rerender(<ConfirmModal {...defaultProps} isSendPending={true} />);
    expect(button).toBeDisabled();
    expect(screen.getByText("Waiting for confirmation")).toBeInTheDocument();

    // Test success
    rerender(<ConfirmModal {...defaultProps} isTransactionSuccess={true} />);
    expect(button).toBeDisabled();
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("handles user interactions", () => {
    render(<ConfirmModal {...defaultProps} />);

    // Test button click
    fireEvent.click(screen.getByRole("button"));
    expect(defaultProps.handleConfirm).toHaveBeenCalledTimes(1);

    // Test escape key
    fireEvent.keyDown(screen.getByTestId("modal"), { key: "Escape" });
    expect(defaultProps.setOpenModal).toHaveBeenCalledWith(false);
  });

  it("handles edge cases", () => {
    render(<ConfirmModal {...defaultProps} estimatedFeeUSD={0} />);
    expect(screen.getByText("Calculating...")).toBeInTheDocument();
  });
});
