import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import LinearProgress from "@mui/material/LinearProgress";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";

const QuestionBank: NextPageWithLayout = () => {
  const { query } = useRouter();
  const { data: subject, isLoading } = trpc.useQuery([
    "shortnotes.subject",
    { code: query.subjectCode as string },
  ]);

  return (
    <>
      <Head>
        <title>{subject?.title ?? "Subject"} | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/" passHref>
            <IconButton component="a">
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/app/question-bank" underline="hover" color="inherit">
            Question Bank
          </Link>
          <Typography color="inherit">{subject?.title ?? "Subject"}</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
            {subject?.title ?? "Subject"}
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
        {subject?.chapters.length === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No chapters found
            </Typography>
          </Box>
        )}
        {subject?.chapters.map((chapter) => (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {chapter.title}
            </Typography>
            <Grid container spacing={2}>
              {chapter.notes.map((note) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={note.id}>
                  <Card>
                    <NextLink
                      href={`/app/short-notes/${query.subjectCode as string}/${
                        note.code
                      }`}
                      passHref
                    >
                      <CardActionArea component={"a"} sx={{ display: "block" }}>
                        <CardContent>
                          <Typography variant="body1" gutterBottom>
                            {note.title}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </NextLink>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {chapter.notes.length === 0 && (
              <Typography gutterBottom variant="body1" component="p">
                No short note found for this chapter.
              </Typography>
            )}
          </>
        ))}
        {isLoading ? <LinearProgress /> : null}
      </Container>
    </>
  );
};

export default QuestionBank;
