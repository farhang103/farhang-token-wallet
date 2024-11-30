import { CircleCheckBigIcon, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";

interface ConfirmModalProps {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
  amount: string;
  toAddress: string;
  estimatedFeeUSD: number;
  isSendPending: boolean;
  isTransactionPending: boolean;
  isTransactionSuccess: boolean;
  handleConfirm: () => void;
}

const ConfirmModal = ({
  openModal,
  setOpenModal,
  amount,
  toAddress,
  estimatedFeeUSD,
  isSendPending,
  isTransactionPending,
  isTransactionSuccess,
  handleConfirm,
}: ConfirmModalProps) => {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="max-w-md border-2 border-black p-1">
        <DialogHeader>
          <DialogTitle className="-mt-3 px-3 pt-6 text-lg font-medium">
            Review send
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 px-6">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-light">You're sending</span>
            <span className="text-3xl font-bold">{amount} FAT</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-light">To</span>
            <span className="text-3xl font-bold">
              {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
            </span>
          </div>
          <div className="h-[1px] w-full bg-gray-200" />
          <div className="flex justify-between">
            <span className="text-sm font-light">Network cost</span>
            <span className="text-sm font-light">
              {estimatedFeeUSD
                ? `$${estimatedFeeUSD.toFixed(2)}`
                : "Calculating..."}
            </span>
          </div>
        </div>
        <Button
          type="button"
          disabled={
            isSendPending || isTransactionPending || isTransactionSuccess
          }
          onClick={handleConfirm}
          className={`w-full rounded-2xl p-7 text-lg ${
            isTransactionSuccess && "disabled:bg-green-700"
          }`}
        >
          {isSendPending || isTransactionPending ? (
            <>
              <Loader2 className="w-10 animate-spin" />
              {isSendPending && "Waiting for confirmation"}
              {isTransactionPending && "Sending..."}
            </>
          ) : isTransactionSuccess ? (
            <>
              <CircleCheckBigIcon className="w-10" />
              Sent
            </>
          ) : (
            "Confirm send"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmModal;
