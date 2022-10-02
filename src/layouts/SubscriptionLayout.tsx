import { useContext, useEffect, type ReactNode } from "react";
import DefaultLayout from "./DefaultLayout";
import SubscriptionContext, {
  SubscriptionProvider,
} from "@/contexts/SubscriptionContext";
import { useRouter } from "next/router";

type LayoutProps = {
  children: React.ReactNode;
};
const SubscriptionLayout = ({ children }: LayoutProps) => {
  return (
    <DefaultLayout>
      <SubscriptionProvider>{hasSubscription(children)}</SubscriptionProvider>
    </DefaultLayout>
  );
};

export default SubscriptionLayout;

function hasSubscription(children: ReactNode) {
  const router = useRouter();
  const [subscription] = useContext(SubscriptionContext);
  useEffect(() => {
    if (!subscription) {
      router.push("/app/subscribe");
    }
  }, [subscription]);
  if (!subscription) {
    return <></>;
  }
  return <>{children}</>;
}
