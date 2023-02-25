import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
// import Button from "@mui/material/Button";
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
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";

const QuestionBank: NextPageWithLayout = () => {
  const router = useRouter();
  const { data: subject, isLoading } = trpc.subjects.getQuestionBanks.useQuery({
    code: router.query.subjectCode as string,
  });

  return (
    <>
      <Head>
        <title>{subject?.title ?? "Subject"} | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
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
        {subject?.chapters.length ? (
          <>
            {subject.chapters.map((chapter) => (
              <Box key={chapter.id}>
                <Typography variant="h6">{chapter.title}</Typography>

                {chapter.questionSets.length ? (
                  <Grid container spacing={2} sx={{ mb: 3, mt: 2 }}>
                    {chapter.questionSets.map((set) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={chapter.id}>
                        <Card>
                          <NextLink href={`/app/test/${set.code}`} passHref>
                            <CardActionArea
                              component={"a"}
                              sx={{ display: "block" }}
                            >
                              <CardContent>
                                <Typography variant="body1" gutterBottom>
                                  {set.title}
                                </Typography>
                                <Typography variant="body2">
                                  total questions: {set._count.questions}
                                </Typography>
                              </CardContent>
                            </CardActionArea>
                          </NextLink>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography
                    gutterBottom
                    variant="body1"
                    color={"text.secondary"}
                    component="p"
                    sx={{ mb: 3 }}
                  >
                    No question found for this chapter.
                  </Typography>
                )}
              </Box>
            ))}
          </>
        ) : (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No chapters found
            </Typography>
          </Box>
        )}

        {isLoading ? <LinearProgress /> : null}
      </Container>
    </>
  );
};

export default QuestionBank;
