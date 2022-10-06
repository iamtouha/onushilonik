import { trpc } from "@/utils/trpc";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import Head from "next/head";
import MuiTable from "@/components/MuiTable";
import { format } from "date-fns";
import { PAYMENT_STATUS } from "@prisma/client";

function Account() {
  const { data: session, status } = useSession();
  const { data: user } = trpc.useQuery(["account.get"], {
    enabled: !!session?.user,
  });
  return (
    <>
      <Head>
        <title>Account | Onushilonik</title>
      </Head>
      <Container sx={{ mt: 4 }}>
        {status === "loading" ? (
          <LinearProgress />
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email: {user?.email}
            </Typography>
            {user?.subscription && (
              <Typography variant="body1" color="text.secondary">
                Phone: {user?.subscription.phoneNumber}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
          Payments
        </Typography>
        <MuiTable
          rows={user?.subscription?.payments ?? []}
          columns={[
            {
              id: "paymentId",
              label: "Payment Id",
            },
            {
              label: "Payment Method",
              id: "method",
              cell: ({ method }) => method.toLowerCase(),
            },
            {
              id: "transactionId",
              label: "Transaction Id",
            },

            {
              id: "createdAt",
              label: "Payment Time",
              cell: ({ createdAt }) => format(createdAt as Date, "dd/MM/yyyy"),
            },
            {
              id: "status",
              label: "Status",
              cell: ({ status }) => {
                return {
                  [PAYMENT_STATUS.PENDING]: (
                    <Typography color="yellow">Pending</Typography>
                  ),
                  [PAYMENT_STATUS.FAILED]: (
                    <Typography color="error">Failed</Typography>
                  ),
                  [PAYMENT_STATUS.SUCCESS]: (
                    <Typography color="lime">Success</Typography>
                  ),
                }[status as PAYMENT_STATUS];
              },
            },
          ]}
        ></MuiTable>
      </Container>
    </>
  );
}

export default Account;
