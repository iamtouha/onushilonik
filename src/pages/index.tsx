import Head from "next/head";
import NextLink from "next/link";
import Grid from "@mui/material/Unstable_Grid2";
import Container from "@mui/material/Container";
import type { NextPageWithLayout } from "./_app";
import HomepageLayout from "@/layouts/HomepageLayout";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";

const services = [
  {
    title: "প্রশ্নব্যাংক",
    description:
      "মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা নিঃসন্দেহে জীবনের একটি কঠিনতম অধ্যায়। আর ভর্তিযুদ্ধে সফল হতে অধিকতর পরিশ্রমের বিকল্প নেই।",
    href: "/app/question-bank",
    cover: "/img/undraw_books.svg",
  },
  {
    title: "বিগত সালের প্রশ্নপত্র",
    description:
      "মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা নিঃসন্দেহে জীবনের একটি কঠিনতম অধ্যায়। আর ভর্তিযুদ্ধে সফল হতে অধিকতর পরিশ্রমের বিকল্প নেই।",
    href: "/app/previous-years",
    cover: "/img/undraw_documents.svg",
  },
  {
    title: "মডেল টেস্ট",
    description:
      "মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা নিঃসন্দেহে জীবনের একটি কঠিনতম অধ্যায়। আর ভর্তিযুদ্ধে সফল হতে অধিকতর পরিশ্রমের বিকল্প নেই।",
    href: "/app/model-tests ",
    cover: "/img/undraw_online_test.svg",
  },
  {
    title: "শর্ট নোট",
    description:
      "মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা নিঃসন্দেহে জীবনের একটি কঠিনতম অধ্যায়। আর ভর্তিযুদ্ধে সফল হতে অধিকতর পরিশ্রমের বিকল্প নেই।",
    href: "/app/short-notes",
    cover: "/img/undraw_notebook.svg",
  },
];

const Home: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Home | Onushilonik</title>
      </Head>
      <Container sx={{ mt: 2, pb: 10 }}>
        <Grid container sx={{ alignItems: "center" }} spacing={4}>
          <Grid xs={12} md={6}>
            <img
              style={{ width: "100%" }}
              alt="medical student illustration svg"
              src="/img/undraw_medicine.svg"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Typography variant="h4" sx={{ mt: 2 }} gutterBottom>
              তোমার চিকিৎসক হওয়ার পথচলা শুরু হোক এখনই ....
            </Typography>
            <Typography variant="body1" gutterBottom>
              মেডিকেল ও ডেন্টাল ভর্তি পরীক্ষা নিঃসন্দেহে জীবনের একটি কঠিনতম
              অধ্যায়। আর ভর্তিযুদ্ধে সফল হতে অধিকতর পরিশ্রমের বিকল্প নেই। এখানে
              অসংখ্য প্রশ্ন সমাধানের মাধ্যমে নিজের প্রস্তুতি যাচাই করতে পারবে
              সহজেই।
            </Typography>
            <NextLink href="/app/start-trial" passHref>
              <Button
                variant="contained"
                sx={{ mt: 3 }}
                size="large"
                color="primary"
                component="a"
              >
                ফ্রি ট্রায়াল শুরু কর
              </Button>
            </NextLink>
          </Grid>
        </Grid>
        <Typography variant="h5" align="center" sx={{ mt: 10, mb: 6 }}>
          সেবা সমূহ
        </Typography>
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid key={service.title} xs={12} md={6}>
              <Card sx={{ height: "100%" }}>
                <NextLink href={service.href} passHref>
                  <CardActionArea
                    component="a"
                    sx={{ display: "flex", height: "100%" }}
                  >
                    <CardContent>
                      <Typography gutterBottom variant="h5">
                        {service.title}
                      </Typography>
                      <Typography variant="subtitle2">
                        {service.description}
                      </Typography>
                    </CardContent>
                    <CardMedia
                      component="img"
                      sx={{ width: 250, p: 2 }}
                      image={service.cover}
                      alt="Live from space album cover"
                    ></CardMedia>
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

Home.getLayout = (page) => <HomepageLayout>{page}</HomepageLayout>;

export default Home;
