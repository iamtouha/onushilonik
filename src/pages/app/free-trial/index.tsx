import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { NextPageWithLayout } from "@/pages/_app";

const FreeTrial: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Free Trial | Onushilonik</title>
      </Head>
      <Container>
        <Box sx={{ my: 4 }}></Box>
      </Container>
    </>
  );
};

export default FreeTrial;
