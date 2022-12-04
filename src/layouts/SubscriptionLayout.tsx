import { useContext, useEffect, type ReactNode } from "react";
import NextLink from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { trpc } from "@/utils/trpc";

export default function SubscriptionLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { data: subscriptionStatus, isLoading } =
    trpc.user.subscriptionStatus.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (subscriptionStatus === "inactive") {
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
              {"You don't have an active subscription"}
            </Typography>

            <Button
              variant="contained"
              LinkComponent={NextLink}
              href="/app"
              color="primary"
              disableElevation
              size="large"
              sx={{ mx: "auto", mt: 2 }}
            >
              Subscribe Now
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscriptionStatus === "pending") {
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
              subscription is pending
            </Typography>
            <Typography sx={{ mb: 2 }} color="text.secondary">
              Please wait for your payment to be approved.
            </Typography>

            <Button
              variant="contained"
              LinkComponent={NextLink}
              href="/app/account"
              color="primary"
              disableElevation
              size="large"
            >
              okay
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscriptionStatus === "expired") {
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
              Subscription is expired!
            </Typography>

            <Button
              variant="contained"
              LinkComponent={NextLink}
              href="/app"
              color="primary"
              disableElevation
              size="large"
              sx={{ mx: "auto", mt: 2 }}
            >
              please subscribe again.
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (subscriptionStatus === "active") {
    return <>{children}</>;
  }
  return <></>;
}
