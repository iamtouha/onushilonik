import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";

const QuestionSets: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Question Sets | Onushilonik Dashboard</title>
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

          <Typography color="inherit">Question Sets</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Question Sets
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
          <NextLink href={"/dashboard/question-sets/add"} passHref>
            <Button variant="contained" color="primary" component="a">
              Add Question Set
            </Button>
          </NextLink>
        </Box>
      </Container>
    </>
  );
};

QuestionSets.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default QuestionSets;
