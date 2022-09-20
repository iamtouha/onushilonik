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
      "অসংখ্য প্রশ্ন অনুশীলনের মাধ্যমে নিজেকে প্রস্তুত ও যাচাই করার সুযোগ",
    href: "/app/question-bank",
    cover: "/img/undraw_books.svg",
  },
  {
    title: "বিগত সালের প্রশ্নপত্র",
    description: "প্রশ্নের ধরণ বুঝতে বিগত বছরের প্রশ্ন সমাধানের বিকল্প নেই",
    href: "/app/previous-years",
    cover: "/img/undraw_documents.svg",
  },
  {
    title: "মডেল টেস্ট",
    description: "সকল টপিকের সমন্বয়ে প্রশ্নপত্র",
    href: "/app/model-tests ",
    cover: "/img/undraw_online_test.svg",
  },
  {
    title: "শর্ট নোট",
    description: "এক নজরে গুরুত্বপূর্ণ তথ্যসমূহ দেখে নাও",
    href: "/app/short-notes",
    cover: "/img/undraw_notebook.svg",
  },
];

const features = [
  {
    title: "ভিডিও লেকচার",
    description: "শেখো নিজের ইচ্ছেমত, পেয়ে যাও ২০ হাজারের বেশি ভিডিও লেকচার।",
    cover: "/img/undraw_video_files.svg",
  },
  {
    title: "লেকচার শীট",
    description: "নিমিষেই পেয়ে যাও সহায়ক লেকচার শীট এবং ইন্টার‍্যক্টিভ বই।",
    cover: "/img/undraw_click_here.svg",
  },
  {
    title: "প্রশ্ন কর মন খুলে",
    description:
      "তোমার যেকোন জিজ্ঞাসায় পাচ্ছ এক্সপার্ট গাইডলাইন এক প্ল্যাটফর্মেই।",
    cover: "/img/undraw_questions.svg",
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
              style={{
                width: "100%",
                display: "block",
                margin: "auto",
                maxWidth: 500,
              }}
              alt="medical student illustration svg"
              src="/img/undraw_medicine.svg"
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Typography
              sx={{ mt: 2, typography: { xs: "h5", md: "h4" } }}
              gutterBottom
            >
              তোমার চিকিৎসক হওয়ার পথচলা শুরু হোক এখনই ....
            </Typography>
            <Typography
              sx={{ mt: 2, typography: { xs: "body2", md: "body1" } }}
              gutterBottom
            >
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
                    <CardContent sx={{ flexGrow: 1 }}>
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
                      alt={service.title}
                    ></CardMedia>
                  </CardActionArea>
                </NextLink>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Grid container sx={{ mt: 10 }} spacing={{ xs: 2, md: 4 }}>
          {features.map((feature, i) => (
            <Grid key={i} xs={12} md={4}>
              <Card elevation={0} sx={{ p: 4 }} color="rgba(0,0,0,0)">
                <CardMedia
                  component="img"
                  sx={{ objectFit: "contain" }}
                  src={feature.cover}
                  alt={feature.title}
                  height={200}
                ></CardMedia>
                <CardContent>
                  <Typography gutterBottom variant="h6" align="center">
                    {feature.title}
                  </Typography>
                  <Typography variant="subtitle2" align="center">
                    {feature.description}
                  </Typography>
                </CardContent>
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
