import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Grid from "@mui/material/Unstable_Grid2";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import BookIcon from "@mui/icons-material/Book";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import QuizIcon from "@mui/icons-material/Quiz";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import { NextPageWithLayout } from "../_app";
import DashboardLayout from "@/layouts/DashboardLayout";

const routes = [
  { name: "Users", href: "/dashboard/users", icon: SupervisedUserCircleIcon },
  { name: "Subjects", href: "/dashboard/subjects", icon: BookIcon },
  { name: "Chapters", href: "/dashboard/chapters", icon: MenuBookIcon },
  { name: "Questions", href: "/dashboard/questions", icon: QuizIcon },
  { name: "Short Notes", href: "/dashboard/notes", icon: StickyNote2Icon },
];

const DashboardHome: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Admin Dashboard | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
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
            <Grid xs={6} sm={4} md={3} lg={3} key={route.name}>
              <Card>
                <NextLink href={route.href} passHref>
                  <CardActionArea component="a">
                    <CardContent>
                      <Avatar sx={{ mx: "auto", width: 60, height: 60 }}>
                        <route.icon sx={{ fontSize: 44 }} />
                      </Avatar>
                      <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                        {route.name}
                      </Typography>
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
