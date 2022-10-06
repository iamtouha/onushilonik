import { useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import { PAYMENT_STATUS } from "@prisma/client";
import { NextPageWithLayout } from "@/pages/_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { toast } from "react-toastify";

const Example: NextPageWithLayout = () => {
  const router = useRouter();
  const { paymentId } = router.query;
  const [status, setStatus] = useState<PAYMENT_STATUS>(PAYMENT_STATUS.PENDING);
  const {
    data: payment,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.useQuery(["admin.payments.get", paymentId as string], {
    enabled: !!paymentId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data) setStatus(data.status);
    },
  });

  const statusMutation = trpc.useMutation("admin.payments.update-status", {
    onSuccess: () => {
      toast.success("Payment status updated");
      refetch();
    },
  });

  return (
    <>
      <Head>
        <title>{payment?.paymentId} | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link href="/dashboard/payments" underline="hover" color="inherit">
            Payments
          </Link>
          <Typography color="inherit">
            {payment?.paymentId ?? "Payment"}
          </Typography>
        </Breadcrumbs>
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        {payment && (
          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
              {payment.paymentId}
            </Typography>
            <Box sx={{ ml: "auto", mr: 0 }} />
          </Box>
        )}
        {payment && (
          <Grid container spacing={2} sx={{ maxWidth: 600 }}>
            <Grid
              sx={{
                display: "flex",
                alignItems: "end",
                gap: 2,
              }}
              item
              xs={12}
            >
              <FormControl variant="standard" fullWidth sx={{ maxWidth: 200 }}>
                <InputLabel id="payment-status-select">
                  Payment Status
                </InputLabel>
                <Select
                  label="Payment Status"
                  id="payment-status-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PAYMENT_STATUS)}
                >
                  {Object.values(PAYMENT_STATUS).map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LoadingButton
                variant="outlined"
                disableElevation
                disabled={payment.status === status || isLoading}
                loading={statusMutation.isLoading}
                onClick={() =>
                  statusMutation.mutate({
                    id: payment.id,
                    status,
                  })
                }
              >
                Update Status
              </LoadingButton>
            </Grid>
            <Grid item xs={12} md={6}>
              <List
                dense
                subheader={
                  <ListSubheader component="div" id="payment-details">
                    Payment Details
                  </ListSubheader>
                }
              >
                <ListItem>
                  <ListItemText
                    primary="Payment ID"
                    secondary={payment?.paymentId}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Payment Method"
                    secondary={payment?.method}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Transaction ID"
                    secondary={payment?.transactionId}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Payment Status"
                    secondary={payment.status}
                  />
                </ListItem>
                {payment.approvedAt && (
                  <ListItem>
                    <ListItemText
                      primary="Approved at"
                      secondary={payment.approvedAt?.toLocaleString()}
                    />
                  </ListItem>
                )}
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <List
                dense
                subheader={
                  <ListSubheader component="div" id="payment-details">
                    Subscription Details
                  </ListSubheader>
                }
              >
                <ListItem>
                  <ListItemText
                    primary="User Email"
                    secondary={payment.subscription.user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="User Phone"
                    secondary={payment.subscription.phoneNumber ?? ""}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        )}
      </Container>
    </>
  );
};

Example.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Example;
