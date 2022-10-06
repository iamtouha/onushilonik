import { useContext, useEffect, type ReactNode } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
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
      <SubscriptionProvider>
        <HasSubscription>{children}</HasSubscription>
      </SubscriptionProvider>
    </DefaultLayout>
  );
};

export default SubscriptionLayout;

function HasSubscription({ children }: { children: ReactNode }) {
  const [subscription] = useContext(SubscriptionContext);

  if (!subscription || subscription.status === "inactive") {
    return (
      <Box
        sx={{
          pt: 4,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              You don't have an active subscription
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              You can subscribe to our service to get access to all features.
            </Typography>
            <NextLink href="/app/subscribe" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                sx={{ mx: "auto" }}
              >
                Subscribe
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscription.status === "pending") {
    return (
      <Box
        sx={{
          pt: 4,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              Your subscription is pending
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Please wait for your subscription to be approved.
            </Typography>
            <NextLink href="/app/account" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                sx={{ mx: "auto" }}
              >
                Account
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscription.status === "expired") {
    return (
      <Box
        sx={{
          pt: 4,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2">
              Your subscription has expired
            </Typography>
            <Typography sx={{ mb: 1.5 }} color="text.secondary">
              Please renew your subscription to get access to all features.
            </Typography>
            <NextLink href="/app/subscribe" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                sx={{ mx: "auto" }}
              >
                Renew subscription
              </Button>
            </NextLink>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscription.status === "active") {
    return <>{children}</>;
  }
  return <></>;
}
