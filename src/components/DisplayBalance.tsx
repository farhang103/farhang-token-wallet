import { useEffect, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import FarhangTokenABI from "~/abis/FarhangToken.json";
import { env } from "~/env";
import SendTokenForm from "./SendTokenForm";
const DisplayBalance = () => {
  const { address } = useAccount();
  const [balance, setBalance] = useState<string>("0");
  const tokenAddress = env.NEXT_PUBLIC_DEPLOYED_TOKEN_ADDRESS as `0x${string}`;
  const tokenABI = FarhangTokenABI.abi;
  const result = useBalance({
    address,
    chainId: sepolia.id,
    token: tokenAddress,
    query: {
      refetchInterval: 5000,
    },
  });

  const { symbol } = result.data ?? {};

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        if (address) {
          setBalance(result.data?.formatted ?? "0");
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [address, result.data?.formatted]);

  return (
    <div className="w-full">
      <div className="flex gap-4 px-4 py-4">
        <h2 className="text-lg font-medium">Balance:</h2>
        <p className="text-lg font-bold">
          {balance} {symbol}
        </p>
      </div>
      <SendTokenForm
        tokenAddress={tokenAddress}
        tokenABI={tokenABI}
        balance={result.data?.value ?? 0n}
      />
    </div>
  );
};

export default DisplayBalance;
