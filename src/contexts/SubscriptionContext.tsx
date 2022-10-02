import { createContext, type ReactNode } from "react";
import { trpc } from "@/utils/trpc";
import { Subscription } from "@prisma/client";
import { useSession } from "next-auth/react";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";

type ContextProps = [Subscription | null | undefined, () => void];

const SubscriptionContext = createContext<ContextProps>([
  null,
  () => undefined,
]);

export default SubscriptionContext;

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const {
    data: subscription,
    isLoading,
    isError,
    refetch,
  } = trpc.useQuery(["subscription.get"], {
    enabled: !!session?.user,
  });

  return (
    <SubscriptionContext.Provider value={[subscription, refetch]}>
      {isLoading ? (
        <LinearProgress />
      ) : isError ? (
        <Alert severity="error">
          {"An error occured while fetching your subscription. "}
          <Button onClick={() => refetch()}>Retry</Button>
        </Alert>
      ) : (
        children
      )}
    </SubscriptionContext.Provider>
  );
};
