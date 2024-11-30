import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeAll } from "vitest";
import DisplayBalance from "../DisplayBalance";

beforeAll(() => {
  vi.mock("wagmi", () => ({
    useAccount: () => ({
      address: "0x1234567890123456789012345678901234567890",
    }),
    useBalance: () => ({
      data: {
        formatted: "100",
        value: BigInt(100000000000000000000), // 100 tokens in wei
        symbol: "FAT",
      },
    }),
  }));

  vi.mock("~/env", () => ({
    env: {
      NEXT_PUBLIC_DEPLOYED_TOKEN_ADDRESS:
        "0x1234567890123456789012345678901234567890",
    },
  }));

  vi.mock("../SendTokenForm", () => ({
    default: () => <div data-testid="send-token-form">Send Token Form</div>,
  }));
});

describe("DisplayBalance", () => {
  it("renders balance information", () => {
    render(<DisplayBalance />);

    expect(screen.getByText("Balance:")).toBeInTheDocument();
    expect(screen.getByText("100 FAT")).toBeInTheDocument();
    expect(screen.getByTestId("send-token-form")).toBeInTheDocument();
  });
});
