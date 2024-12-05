"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import DisplayBalance from "~/components/DisplayBalance";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

const DashboardPage = () => {
  const { isConnected } = useAccount();

  const router = useRouter();
  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [isConnected, router]);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-md flex-col gap-4">
        {isConnected ? (
          <>
            <ConnectButton
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "address",
              }}
              chainStatus={{
                smallScreen: "icon",
                largeScreen: "icon",
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: false,
              }}
            />

            <Card className="w-full rounded-2xl">
              <DisplayBalance />
            </Card>
          </>
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
