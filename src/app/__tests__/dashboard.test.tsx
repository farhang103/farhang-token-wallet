import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccount } from "wagmi";
import DashboardPage from "../dashboard/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("wagmi", () => ({
  useAccount: vi.fn(),
}));

vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: () => <div data-testid="connect-button">Connect Button</div>,
}));

vi.mock("~/components/DisplayBalance", () => ({
  default: () => <div data-testid="display-balance">Display Balance</div>,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAccount).mockReturnValue({
      address: "0x123",
      addresses: ["0x123"],
      chain: undefined,
      chainId: 1,
      connector: undefined,
      isConnected: true,
      isConnecting: false,
      isDisconnected: false,
      isReconnecting: true,
      status: "reconnecting",
    });
  });

  it("renders dashboard components when user is connected", () => {
    render(<DashboardPage />);

    expect(screen.getByTestId("connect-button")).toBeInTheDocument();
    expect(screen.getByTestId("display-balance")).toBeInTheDocument();
  });

  it("redirects to home page when user is not connected", () => {
    vi.mocked(useAccount).mockReturnValue({
      address: undefined,
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isConnected: false,
      isConnecting: false,
      isDisconnected: true,
      isReconnecting: false,
      status: "disconnected",
    });

    render(<DashboardPage />);

    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
