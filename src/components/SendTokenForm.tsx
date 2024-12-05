import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Abi,
  encodeFunctionData,
  formatEther,
  isAddress,
  parseEther,
} from "viem";
import {
  useAccount,
  useEstimateFeesPerGas,
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
import { toast } from "~/hooks/use-toast";
import { useGasFeeCalculation } from "~/hooks/useGasFeeCalculation";
import ConfirmModal from "./ConfirmModal";

interface SendTokensFormProps {
  tokenAddress: string;
  tokenABI: Abi;
  balance: bigint;
}

const SendTokensForm: React.FC<SendTokensFormProps> = ({
  tokenAddress,
  tokenABI,
  balance,
}) => {
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { chain } = useAccount();
  const { data: feesPerGas } = useEstimateFeesPerGas();
  const { maxFeePerGas, maxPriorityFeePerGas } = feesPerGas ?? {};

  const { estimatedFeeUSD } = useGasFeeCalculation({
    tokenAddress: tokenAddress as `0x${string}`,
    tokenABI,
    toAddress,
    amount,
  });

  const formSchema = z.object({
    toAddress: z
      .string()
      .nonempty("Address is empty")
      .min(10, "Address is too short")
      .startsWith("0x")
      .refine((val) => isAddress(val), "Invalid address"),
    amount: z
      .string()
      .nonempty("Amount is empty")
      .refine((val) => !isNaN(Number(val)), "Must be a number")
      .refine((val) => Number(val) > 0, "Amount must be greater than 0")
      .refine(
        (val) => Number(val) <= Number(formatEther(balance)),
        "Insufficient balance",
      ),
  });

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
        if (!error.message.includes("User denied transaction signature")) {
          toast({
            title: "Transaction failed",
            description: error.message,
            variant: "destructive",
          });
        }
      },
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    setToAddress(data.toAddress);
    setAmount(Number(data.amount));
    setOpenModal(true);
  });

  const handleConfirm = () => {
    try {
      sendTransaction({
        to: tokenAddress as `0x${string}`,
        data: encodeFunctionData({
          abi: tokenABI,
          functionName: "transfer",
          args: [toAddress as `0x${string}`, parseEther(amount.toString())],
        }),
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        type: "eip1559",
      });
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const rawAmount = Number(formatEther(balance)) * percentage;
    const roundedAmount = Number(rawAmount.toFixed(6));
    form.setValue("amount", roundedAmount.toString());
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
