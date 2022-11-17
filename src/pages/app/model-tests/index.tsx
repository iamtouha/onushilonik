import React, { useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import Card from "@mui/material/Card";
import Pagination from "@mui/material/Pagination";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import LinearProgress from "@mui/material/LinearProgress";
import { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";

const perPage = 10;

const ModelTests: NextPageWithLayout = () => {
  const router = useRouter();
  const { data, isLoading } = trpc.useQuery(
    [
      "questionset.model-tests",
      { page: +(router.query.page as string), perPage },
    ],
    { enabled: !!router.query.page, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    const page = router.query.page;
    if (!page) {
      router.push(`${router.asPath}?page=1`);
    }
  }, [router.push, router.asPath, router.query.page]);

  return (
    <>
      <Head>
        <title>Model Tests | Onushilonik Dashboard</title>
      </Head>
      {isLoading ? <LinearProgress /> : null}
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Typography color="inherit">Model Tests</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Model Tests
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>

        <Grid container spacing={2}>
          {data?.questionSets.map((set) => (
            <Grid item xs={12} md={6} lg={4} key={set.id}>
              <Card>
                <NextLink href={`/app/test/${set.code}`} passHref>
                  <CardActionArea component={"a"} sx={{ display: "block" }}>
                    <CardContent>
                      <Typography gutterBottom variant="h6" component="h5">
                        {set.title}
                      </Typography>
                      <Typography variant="body1" component="p">
                        Total questions: {set._count.questions}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </NextLink>
              </Card>
            </Grid>
          ))}
        </Grid>
        {!isLoading &&
          ((data?.questionSets.length ?? 0) > 0 ? (
            <Pagination
              sx={{ mt: 2 }}
              onChange={(e, page) => {
                router.push({
                  pathname: router.pathname,
                  query: { ...router.query, page },
                });
              }}
              page={parseInt(router.query.page as string)}
              count={Math.ceil((data?.total ?? 0) / perPage)}
            />
          ) : (
            <Typography gutterBottom variant="h6" align="center" sx={{ mt: 4 }}>
              No Model Tests Found!
            </Typography>
          ))}
      </Container>
    </>
  );
};

export default ModelTests;
