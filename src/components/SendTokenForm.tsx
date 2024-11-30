import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { encodeFunctionData, formatEther, isAddress, parseEther } from "viem";
import {
  useAccount,
  useBlock,
  useBlockNumber,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import ConfirmModal from "./ConfirmModal";

interface SendTokensFormProps {
  tokenAddress: string;
  tokenABI: any[];
  balance: bigint;
}

const formSchema = z.object({
  toAddress: z
    .string()
    .min(10, "Address is too short")
    .startsWith("0x")
    .refine((val) => isAddress(val), "Invalid address"),
  amount: z
    .string()
    .nonempty("Amount is empty")
    .refine((val) => !isNaN(Number(val)), "Must be a number")
    .refine((val) => Number(val) >= 0, "Amount must be a positive number"),
});

const SendTokensForm: React.FC<SendTokensFormProps> = ({
  tokenAddress,
  tokenABI,
  balance,
}) => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [estimatedFeeUSD, setEstimatedFeeUSD] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { chain } = useAccount();

  const gasLimit = BigInt(50000);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toAddress: "" as `0x${string}`,
      amount: "",
    },
  });

  const { isLoading: isTransactionPending, isSuccess: isTransactionSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  const { sendTransaction, isPending: isSendPending } = useSendTransaction({
    mutation: {
      onSuccess: (data) => {
        setTxHash(data);
      },
      onError: (error) => {
        console.error("Transaction failed:", error);
        setOpenModal(false);
      },
    },
  });

  // Fetch ETH price in USD
  const { data: ethPriceData } = useQuery({
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

  // Fetch gas price data from Blocknative Gas Estimator API
  const { data: gasData } = useQuery({
    queryKey: ["gasData"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.blocknative.com/gasprices/blockprices",
      );
      const data = await response.json();
      const standardSpeed = data.blockPrices[0].estimatedPrices.find(
        (p: any) => p.confidence === 70,
      );
      return {
        maxFeePerGas: standardSpeed.maxFeePerGas,
        maxPriorityFeePerGas: standardSpeed.maxPriorityFeePerGas,
      };
    },
    enabled: true,
    retry: 3,
    refetchInterval: 15000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Fetch the latest block to get baseFeePerGas
  const { data: blockNumberData } = useBlockNumber({
    watch: true,
  });
  const { data: blockData } = useBlock({
    blockNumber: blockNumberData,
  });

  useEffect(() => {
    if (ethPriceData) {
      setEthPrice(ethPriceData);
    }
  }, [ethPriceData]);

  useEffect(() => {
    calculateGasFee();
  }, [gasData, ethPrice, blockData]);

  const calculateGasFee = () => {
    if (
      !gasData?.maxFeePerGas ||
      !gasData?.maxPriorityFeePerGas ||
      !ethPrice ||
      !blockData?.baseFeePerGas
    ) {
      setEstimatedFeeUSD(null);
      return;
    }

    try {
      const BUFFER_MULTIPLIER = 115n; // 15% buffer
      const HUNDRED_PERCENT = 100n;

      const baseFeePerGasWei = blockData.baseFeePerGas;

      const maxPriorityFeePerGasWei =
        (BigInt(Math.round(gasData.maxPriorityFeePerGas * 1e9)) *
          BUFFER_MULTIPLIER) /
        HUNDRED_PERCENT;
      const maxFeePerGasWei =
        (BigInt(Math.round(gasData.maxFeePerGas * 1e9)) * BUFFER_MULTIPLIER) /
        HUNDRED_PERCENT;

      const effectiveGasPriceWei = baseFeePerGasWei + maxPriorityFeePerGasWei;
      const finalGasPriceWei =
        effectiveGasPriceWei > maxFeePerGasWei
          ? maxFeePerGasWei
          : effectiveGasPriceWei;

      const totalGasCostWei = gasLimit * finalGasPriceWei;
      const totalGasCostETH = Number(formatEther(totalGasCostWei));
      const totalGasCostUSD = totalGasCostETH * ethPrice;

      setEstimatedFeeUSD(totalGasCostUSD);
    } catch (error) {
      console.error("Error calculating gas fee:", error);
      setEstimatedFeeUSD(null);
    }
  };

  const handleSubmit = form.handleSubmit((data) => {
    setToAddress(data.toAddress);
    setAmount(Number(data.amount));
    setOpenModal(true);
  });

  const handleConfirm = async () => {
    try {
      if (!gasData || !blockData) {
        console.error("Gas data or block data is unavailable");
        return;
      }

      const adjustedMaxPriorityFeePerGas = gasData.maxPriorityFeePerGas * 0.9;
      const maxPriorityFeePerGasWei = BigInt(
        Math.round(adjustedMaxPriorityFeePerGas * 1e9),
      );

      const adjustedMaxFeePerGas = gasData.maxFeePerGas * 0.9;
      const maxFeePerGasWei = BigInt(Math.round(adjustedMaxFeePerGas * 1e9));

      sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: encodeFunctionData({
          abi: tokenABI,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, parseEther(amount.toString())],
        }),
        gas: gasLimit,
        maxFeePerGas: maxFeePerGasWei,
        maxPriorityFeePerGas: maxPriorityFeePerGasWei,
        type: "eip1559",
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const amount = (Number(formatEther(balance)) * percentage).toString();
    form.setValue("amount", amount);
  };

  useEffect(() => {
    if (isTransactionSuccess) {
      setTimeout(() => {
        setOpenModal(false);
        form.reset();
        setTxHash(undefined);
      }, 2000);
    }
  }, [isTransactionSuccess]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <FormLabel className="flex items-end">Amount</FormLabel>
                    <div className="flex gap-2">
                      {[
                        { percentage: 0.05, label: "5%" },
                        { percentage: 0.25, label: "25%" },
                        { percentage: 0.5, label: "50%" },
                        { percentage: 1, label: "100%" },
                      ].map(({ percentage, label }) => (
                        <Button
                          className="rounded-xl"
                          key={label}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={chain?.name !== "Sepolia"}
                          onClick={() => handlePercentageClick(percentage)}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      disabled={chain?.name !== "Sepolia"}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="toAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex">Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0x..."
                    {...field}
                    autoComplete="off"
                    disabled={chain?.name !== "Sepolia"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full rounded-xl p-7 text-lg"
            disabled={
              isSendPending || isTransactionPending || chain?.name !== "Sepolia"
            }
          >
            Send
          </Button>
          <ConfirmModal
            openModal={openModal}
            setOpenModal={setOpenModal}
            handleConfirm={handleConfirm}
            amount={amount.toString()}
            toAddress={toAddress}
            estimatedFeeUSD={estimatedFeeUSD ?? 0}
            isSendPending={isSendPending}
            isTransactionPending={isTransactionPending}
            isTransactionSuccess={isTransactionSuccess}
          />
        </form>
      </Form>
    </div>
  );
};

export default SendTokensForm;
