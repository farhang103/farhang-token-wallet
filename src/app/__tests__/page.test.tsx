import { render, screen } from "@testing-library/react";
import HomePage from "../page";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { describe, expect, it, vi } from "vitest";

vi.mock("wagmi");
vi.mock("next/navigation");

describe("HomePage", () => {
  it("redirects to dashboard when connected", () => {
    const mockPush = vi.fn();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useAccount as any).mockReturnValue({
      isConnected: true,
      address: "0x123",
    });

    render(<HomePage />);

    expect(mockPush).toHaveBeenCalledWith("/dashboard");
  });

  it("stays on home page when not connected", () => {
    const mockPush = vi.fn();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useAccount as any).mockReturnValue({
      isConnected: false,
      address: undefined,
    });

    render(<HomePage />);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
