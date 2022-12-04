import NextLink from "next/link";
import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { trpc } from "@/utils/trpc";
import Grid from "@mui/material/Grid";
import Subscribe from "@/components/Subscribe";
import BorderedCircularProgress from "@/components/elements/BorderedCircularProgress";
import { AnswerSheet, OPTION, Prisma } from "@prisma/client";
import { format } from "date-fns";

type SheetType = AnswerSheet & {
  questionSet: {
    _count: Prisma.QuestionSetCountOutputType;
    id: string;
    code: string;
    title: string;
  };
  answers: {
    question: {
      id: string;
      correctOption: OPTION;
    };
    id: string;
    option: OPTION;
  }[];
};

const Home = () => {
  const { data: subscriptionStatus, isLoading } =
    trpc.user.subscriptionStatus.useQuery();
  const { data: sheets } = trpc.sheets.recent.useQuery(undefined, {
    enabled: subscriptionStatus === "active",
    refetchOnWindowFocus: false,
  });

  const calculateResult = (sheet: SheetType) => {
    const correct = sheet.answers.filter(
      (a) => a.question.correctOption === a.option
    ).length;
    const total = sheet.questionSet._count.questions;
    return {
      label: `${Math.round((100 * correct) / total)}%`,
      value: correct / total,
    };
  };
  return (
    <>
      <Head>
        <title>Home | Onushilonik</title>
      </Head>
      <Container>
        <Box sx={{ my: 4 }}>
          {isLoading ? "Loading..." : ""}
          {subscriptionStatus && (
            <>
              {subscriptionStatus !== "active" && (
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ display: "flex" }}>
                    <Typography variant="h5" sx={{ flex: 1 }} component="h2">
                      Start free trial now
                    </Typography>
                    <NextLink passHref href="/app/free-trial">
                      <Button disableElevation size="large" variant="contained">
                        Free Trial
                      </Button>
                    </NextLink>
                  </CardContent>
                </Card>
              )}
              {["expired", "inactive"].includes(subscriptionStatus) && (
                <Subscribe />
              )}
              {subscriptionStatus === "pending" && (
                <Card sx={{ mb: 2 }}>
                  <CardContent sx={{ display: "flex" }}>
                    <Typography variant="h5" sx={{ flex: 1 }} component="h2">
                      Your subscription is pending
                    </Typography>
                    <NextLink href="/app/account">
                      <Button disableElevation size="large" variant="contained">
                        account
                      </Button>
                    </NextLink>
                  </CardContent>
                </Card>
              )}
              {subscriptionStatus === "active" && (
                <>
                  {sheets ? (
                    <>
                      <Typography variant="h5" sx={{ mb: 2 }} component="h2">
                        Your Recent Attampts
                      </Typography>
                      <Grid container spacing={2}>
                        {sheets.map((sheet, i) => (
                          <Grid item xs={12} sm={6} md={4} key={sheet.id}>
                            <Card>
                              <NextLink
                                href={`/app/test/${sheet.questionSet.code}/sheet/${sheet.id}?q=1`}
                              >
                                <CardActionArea sx={{ display: "block" }}>
                                  <CardContent sx={{ display: "flex" }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography
                                        color="textSecondary"
                                        variant="h5"
                                      >
                                        {sheet.questionSet.title}
                                      </Typography>
                                      <Typography
                                        color="textSecondary"
                                        gutterBottom
                                      >
                                        {sheet.answers.length} questions
                                        answered
                                      </Typography>
                                      <Typography color="textSecondary">
                                        {format(
                                          sheet.createdAt,
                                          "hh:mm a, dd MMMM yyyy"
                                        )}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      {
                                        <BorderedCircularProgress
                                          color="info"
                                          size={80}
                                          value={Math.round(
                                            calculateResult(sheet).value * 100
                                          )}
                                          label={calculateResult(sheet).label}
                                        />
                                      }
                                    </Box>
                                  </CardContent>
                                </CardActionArea>
                              </NextLink>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </>
                  ) : null}
                  {sheets?.length === 0 && (
                    <Card sx={{ mb: 2 }}>
                      <CardContent sx={{ display: "flex" }}>
                        <Typography
                          variant="h5"
                          sx={{ flex: 1 }}
                          component="h2"
                        >
                          Start a new test now
                        </Typography>
                        <NextLink passHref href="/app/model-tests">
                          <Button
                            disableElevation
                            size="large"
                            variant="contained"
                          >
                            view tests
                          </Button>
                        </NextLink>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </Box>
      </Container>
    </>
  );
};
export default Home;
