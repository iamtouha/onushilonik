import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import BookIcon from "@mui/icons-material/Book";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import ListAltIcon from "@mui/icons-material/ListAlt";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import PaymentIcon from "@mui/icons-material/Payment";
import type { NextPageWithLayout } from "../_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useSession } from "next-auth/react";
import ColorModeContext from "@/contexts/ColorModeContext";

const adminRoutes = [
  { name: "Subjects", href: "/dashboard/subjects", icon: BookIcon },
  { name: "Chapters", href: "/dashboard/chapters", icon: MenuBookIcon },
  { name: "Questions", href: "/dashboard/questions", icon: QuizIcon },
  { name: "Short Notes", href: "/dashboard/notes", icon: StickyNote2Icon },
  {
    name: "Question Sets",
    href: "/dashboard/question-sets",
    icon: ListAltIcon,
  },
];

const superAdminRoutes = [
  ...adminRoutes,
  { name: "Users", href: "/dashboard/users", icon: SupervisedUserCircleIcon },
  { name: "Payments", href: "/dashboard/payments", icon: PaymentIcon },
];

const DashboardHome: NextPageWithLayout = () => {
  const [mode] = React.useContext(ColorModeContext);
  const { data: session } = useSession({ required: true });
  const routes =
    session?.user?.role === "SUPER_ADMIN" ? superAdminRoutes : adminRoutes;
  return (
    <>
      <Head>
        <title>Home | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
              <HomeIcon />
            </IconButton>
          </NextLink>

          <Typography color="inherit">Dashboard</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4">
          Admin Dashboard
        </Typography>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {routes.map((route) => (
            <Grid xs={12} sm={6} md={3} key={route.name}>
              <Card variant={mode === "dark" ? "elevation" : "outlined"}>
                <NextLink href={route.href} passHref>
                  <CardActionArea component="a">
                    <CardContent
                      sx={{ display: "flex", alignItems: "center", gap: 2 }}
                    >
                      <route.icon sx={{ fontSize: 44 }} />
                      <Typography variant="h6">{route.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </NextLink>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

DashboardHome.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default DashboardHome;
