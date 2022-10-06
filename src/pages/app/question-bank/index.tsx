import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { NextPageWithLayout } from "@/pages/_app";
import SubscriptionLayout from "@/layouts/SubscriptionLayout";

const QuestionBank: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Question Bank | Onushilonik</title>
      </Head>
      <Container>
        <Box sx={{ my: 4 }}></Box>
      </Container>
    </>
  );
};

QuestionBank.getLayout = (page) => (
  <SubscriptionLayout>{page}</SubscriptionLayout>
);

export default QuestionBank;
