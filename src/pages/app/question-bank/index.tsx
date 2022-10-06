import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { NextPageWithLayout } from "@/pages/_app";

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

export default QuestionBank;
