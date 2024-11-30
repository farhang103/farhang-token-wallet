import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ConfirmModal from "../ConfirmModal";

vi.mock("~/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) => (
    <div
      data-testid="modal"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onOpenChange(false);
        }
      }}
    >
      {open && children}
    </div>
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="modal-title">{children}</div>
  ),
}));

vi.mock("~/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

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

  it("renders modal content correctly", () => {
    render(<ConfirmModal {...defaultProps} />);

    expect(screen.getByText("Review send")).toBeInTheDocument();
    expect(screen.getByText("You're sending")).toBeInTheDocument();
    expect(screen.getByText("100 FAT")).toBeInTheDocument();
    expect(screen.getByText("To")).toBeInTheDocument();
    expect(screen.getByText("0x1234...7890")).toBeInTheDocument();
    expect(screen.getByText("Network cost")).toBeInTheDocument();
    expect(screen.getByText("$2.50")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Confirm send" }),
    ).toBeInTheDocument();
  });

  it("shows loading state when transaction is pending", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        isSendPending={false}
        isTransactionPending={true}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();
  });

  it("shows waiting state when waiting for confirmation", () => {
    render(
      <ConfirmModal
        {...defaultProps}
        isSendPending={true}
        isTransactionPending={false}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Waiting for confirmation")).toBeInTheDocument();
  });

  it("shows success state after transaction completes", () => {
    render(<ConfirmModal {...defaultProps} isTransactionSuccess={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText("Sent")).toBeInTheDocument();
  });

  it("shows calculating message when fee is not available", () => {
    render(<ConfirmModal {...defaultProps} estimatedFeeUSD={0} />);

    expect(screen.getByText("Calculating...")).toBeInTheDocument();
  });

  it("calls handleConfirm when confirm button is clicked", () => {
    render(<ConfirmModal {...defaultProps} />);

    const confirmButton = screen.getByRole("button", { name: "Confirm send" });
    fireEvent.click(confirmButton);

    expect(defaultProps.handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls setOpenModal when dialog is closed", () => {
    render(<ConfirmModal {...defaultProps} />);

    const modal = screen.getByTestId("modal");
    fireEvent.keyDown(modal, { key: "Escape" });

    expect(defaultProps.setOpenModal).toHaveBeenCalledWith(false);
  });
});
