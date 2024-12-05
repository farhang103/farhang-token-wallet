import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useEstimateGas, useGasPrice } from "wagmi";
import { sepolia } from "wagmi/chains";
import { Abi, encodeFunctionData, parseEther } from "viem";

interface UseGasFeeCalculationProps {
  tokenAddress: `0x${string}`;
  tokenABI: Abi;
  toAddress?: string;
  amount: number;
}

export const useGasFeeCalculation = ({
  tokenAddress,
  tokenABI,
  toAddress,
  amount,
}: UseGasFeeCalculationProps) => {
  const [estimatedFeeUSD, setEstimatedFeeUSD] = useState<number | null>(null);

  // Get gas price
  const { data: gasPrice } = useGasPrice({
    chainId: sepolia.id,
  });

  // Get gas limit
  const { data: gasLimit } = useEstimateGas({
    to: tokenAddress,
    data: toAddress
      ? encodeFunctionData({
          abi: tokenABI,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, parseEther(amount.toString())],
        })
      : undefined,
  });

  // Fetch ETH price in USD
  const { data: ethPrice } = useQuery({
    queryKey: ["ethPrice"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      );
      const data = await response.json();
      return data.ethereum.usd;
    },
    enabled: true,
    retry: 3,
    refetchInterval: 60000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!ethPrice || !gasPrice || !gasLimit || !amount || !toAddress) {
      setEstimatedFeeUSD(null);
      return;
    }

    try {
      const BUFFER_MULTIPLIER = 1.15; // 15% buffer
      setEstimatedFeeUSD(
        (Number(gasPrice) / 1e18) *
          Number(gasLimit) *
          ethPrice *
          BUFFER_MULTIPLIER,
      );
    } catch (error) {
      console.error("Error calculating gas fee:", error);
      setEstimatedFeeUSD(null);
    }
  }, [gasPrice, ethPrice, gasLimit, amount, toAddress]);

  return {
    estimatedFeeUSD,
  };
};
