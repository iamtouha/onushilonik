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
import LinearProgress from "@mui/material/LinearProgress";
import { NextPageWithLayout } from "@/pages/_app";
import SubscriptionLayout from "@/layouts/SubscriptionLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import ShortNote from "@/components/ShortNote";
import DefaultLayout from "@/layouts/DefaultLayout";

const Example: NextPageWithLayout = () => {
  const { query } = useRouter();
  const { data: note, isLoading } = trpc.notes.getWithCode.useQuery({
    code: query.noteCode as string,
  });
  return (
    <>
      <Head>
        <title>{note?.title ?? "Short Note"} | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Typography color="inherit">Short Notes</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            {note?.title ?? "Short Note"}
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
        {isLoading ? <LinearProgress /> : null}
        <Box>{note ? <ShortNote content={note.content} /> : null}</Box>
      </Container>
    </>
  );
};

Example.getLayout = (page) => (
  <DefaultLayout>
    <SubscriptionLayout>{page}</SubscriptionLayout>
  </DefaultLayout>
);

export default Example;
