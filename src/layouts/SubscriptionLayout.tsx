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
    <SubscriptionProvider>
      <HasSubscription>{children}</HasSubscription>
    </SubscriptionProvider>
  );
};

export default SubscriptionLayout;

function HasSubscription({ children }: { children: ReactNode }) {
  const [subscription] = useContext(SubscriptionContext);

  if (!subscription || subscription.status === "inactive") {
    return (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          height: "calc(100vh - 70px)",
        }}
      >
        <Card variant="outlined" sx={{ textAlign: "center" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom component="h2">
              আপনার সাবস্ক্রিপশন সক্রিয় নয়
            </Typography>

            <NextLink href="/app/subscribe" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                disableElevation
                size="large"
                sx={{ mx: "auto", mt: 2 }}
              >
                সাবস্ক্রাইব করুন
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
          display: "grid",
          placeItems: "center",
          height: "calc(100vh - 70px)",
        }}
      >
        <Card variant="outlined" sx={{ textAlign: "center" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom component="h2">
              সাবস্ক্রিপশন পেন্ডিং
            </Typography>
            <Typography sx={{ mb: 2 }} color="text.secondary">
              দয়া করে সাবস্ক্রিপশনটি অনুমোদনের জন্য অপেক্ষা করুন
            </Typography>
            <NextLink href="/app/account" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                disableElevation
                size="large"
              >
                okay
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
          display: "grid",
          placeItems: "center",
          height: "calc(100vh - 70px)",
        }}
      >
        <Card variant="outlined" sx={{ textAlign: "center" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom component="h2">
              সাবস্ক্রিপশন মেয়াদোত্তীর্ণ
            </Typography>

            <NextLink href="/app/subscribe" passHref>
              <Button
                variant="contained"
                component="a"
                color="primary"
                disableElevation
                size="large"
                sx={{ mx: "auto", mt: 2 }}
              >
                পুনরায় সাবস্ক্রাইব করুন
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
