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
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";

const Users: NextPageWithLayout = () => {
  const router = useRouter();

  const { data: user } = trpc.useQuery(
    ["users.getOne", router.query.userId as string],
    { enabled: !!router.query.userId, refetchOnWindowFocus: false }
  );

  return (
    <>
      <Head>
        <title>{user?.name ?? "user"} | Onushilonik</title>
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
          <Link href="/dashboard/users" underline="hover" color="inherit">
            Users
          </Link>
          <Typography color="inherit">{user?.name ?? "user"}</Typography>
        </Breadcrumbs>
        <Typography variant="h4">{user?.name ?? "user"}</Typography>
        <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
          {user?.email}
        </Typography>
      </Container>
    </>
  );
};

Users.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Users;
