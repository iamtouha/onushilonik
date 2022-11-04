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
import SubscriptionLayout from "@/layouts/SubscriptionLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";

const Example: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Example | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Typography color="inherit">Example</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Example
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
      </Container>
    </>
  );
};

Example.getLayout = (page) => <SubscriptionLayout>{page}</SubscriptionLayout>;

export default Example;
