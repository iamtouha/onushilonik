import React from "react";
import Head from "next/head";
import Container from "@mui/material/Container";
import DashboardLayout from "@/layouts/DashboardLayout";
import { NextPageWithLayout } from "@/pages/_app";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import NextLink from "next/link";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Link from "@/components/Link";

const Users: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Users | Onushilonik</title>
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

          <Typography color="inherit">Users</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4">
          Users
        </Typography>
      </Container>
    </>
  );
};

Users.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Users;
