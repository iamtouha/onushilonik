import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import { useSession } from "next-auth/react";
import Head from "next/head";

function Account() {
  const { data: session, status } = useSession();
  return (
    <>
      <Head>
        <title>Account | Onushilonik</title>
      </Head>
      <Container>
        {status === "loading" ? (
          <LinearProgress />
        ) : (
          <Box>
            <Typography variant="h5"> {session?.user?.name}</Typography>
            <Typography variant="body1">
              Email: {session?.user?.email}
            </Typography>
          </Box>
        )}
      </Container>
    </>
  );
}

export default Account;
