// import { useEffect } from "react";
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
import type { NextPageWithLayout } from "@/pages/_app";
import { trpc } from "@/utils/trpc";
import { SET_TYPE } from "@prisma/client";

const perPage = 10;

const ModelTests: NextPageWithLayout = () => {
  const router = useRouter();
  const { data, isLoading } = trpc.sets.get.useQuery(
    {
      type: SET_TYPE.MODEL_TEST,
      page: router.query.page ? +(router.query.page as string) : 1,
      perPage,
    },

    { refetchOnWindowFocus: false }
  );

  return (
    <>
      <Head>
        <title>Model Tests | Onushilonik Dashboard</title>
      </Head>

      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
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

        {isLoading ? (
          <LinearProgress />
        ) : data?.questionSets.length ? (
          <>
            <Grid container spacing={2}>
              {data?.questionSets.map((set) => (
                <Grid item xs={12} md={6} lg={4} key={set.id}>
                  <Card>
                    <NextLink href={`/app/test/${set.code}`}>
                      <CardActionArea sx={{ display: "block" }}>
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
            <Pagination
              sx={{ mt: 2 }}
              onChange={(e, page) => {
                router.push({
                  pathname: router.pathname,
                  query: { ...router.query, page },
                });
              }}
              page={parseInt(router.query.page as string)}
              count={Math.ceil((data?.count ?? 0) / perPage)}
            />
          </>
        ) : (
          <Typography gutterBottom variant="h6" align="center" sx={{ mt: 4 }}>
            No Model Tests Found!
          </Typography>
        )}
      </Container>
    </>
  );
};

export default ModelTests;
