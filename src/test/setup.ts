import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock FarhangToken ABI
vi.mock("~/abis/FarhangToken.json", () => ({
  default: {
    abi: [],
  },
}));

// Mock env
vi.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_DEPLOYED_TOKEN_ADDRESS: "0x123",
  },
}));

// Mock UI components
vi.mock("~/components/ui/button", () => ({
  Button: vi.fn(({ children }) => children),
}));

vi.mock("~/components/ui/form", () => ({
  Form: vi.fn(({ children }) => children),
  FormControl: vi.fn(({ children }) => children),
  FormField: vi.fn(({ children }) => children),
  FormItem: vi.fn(({ children }) => children),
  FormLabel: vi.fn(({ children }) => children),
  FormMessage: vi.fn(({ children }) => children),
}));

vi.mock("~/components/ui/input", () => ({
  Input: vi.fn(() => null),
}));

vi.mock("~/components/ui/dialog", () => ({
  Dialog: vi.fn(({ children }) => children),
  DialogContent: vi.fn(({ children }) => children),
  DialogHeader: vi.fn(({ children }) => children),
  DialogTitle: vi.fn(({ children }) => children),
}));

// Mock wagmi hooks
vi.mock("wagmi", () => ({
  useAccount: vi.fn(() => ({ isConnected: true, address: "0x123" })),
  useBalance: vi.fn(() => ({
    data: {
      formatted: "100",
      symbol: "FAT",
      value: BigInt(100),
    },
  })),
  useBlockNumber: vi.fn(() => ({ data: BigInt(1) })),
  useBlock: vi.fn(() => ({
    data: {
      baseFeePerGas: BigInt(1000000000),
    },
  })),
  useSendTransaction: vi.fn(() => ({
    sendTransaction: vi.fn(),
    isPending: false,
  })),
  useWaitForTransactionReceipt: vi.fn(() => ({
    isLoading: false,
    isSuccess: false,
  })),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

// Mock @rainbow-me/rainbowkit
vi.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: vi.fn(() => null),
}));

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", () => ({
  useQuery: vi.fn(({ queryKey }) => {
    if (queryKey[0] === "gasData") {
      return {
        data: {
          blockPrices: [
            {
              estimatedPrices: [
                {
                  confidence: 70,
                  maxFeePerGas: 50000000000,
                  maxPriorityFeePerGas: 2000000000,
                },
              ],
            },
          ],
        },
      };
    }
    if (queryKey[0] === "ethPrice") {
      return {
        data: {
          ethereum: { usd: 2000 },
        },
      };
    }
    return { data: null };
  }),
}));
