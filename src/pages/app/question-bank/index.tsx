import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import LinearProgress from "@mui/material/LinearProgress";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";

const QuestionBank: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: subjects, isLoading } = trpc.useQuery([
    "questionbank.subjects",
  ]);

  return (
    <>
      <Head>
        <title>Question Bank | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Typography color="inherit">Question Bank</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Question Bank
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
        <Grid container spacing={2}>
          {subjects?.map((subject) => (
            <Grid item xs={12} md={6} lg={4} key={subject.id}>
              <Card>
                <NextLink href={`${router.asPath}/${subject.id}`} passHref>
                  <CardActionArea component={"a"} sx={{ display: "block" }}>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="h5">
                        {subject.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </NextLink>
              </Card>
            </Grid>
          ))}
        </Grid>
        {isLoading ? <LinearProgress /> : null}
      </Container>
    </>
  );
};

export default QuestionBank;
