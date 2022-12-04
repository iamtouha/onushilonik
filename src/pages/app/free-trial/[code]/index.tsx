import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { trpc } from "@/utils/trpc";
import { toast } from "react-toastify";
import { format } from "date-fns";
import BorderedCircularProgress from "@/components/elements/BorderedCircularProgress";
import { type OPTION } from "@prisma/client";
import { type NextPageWithLayout } from "@/pages/_app";

type SheetType = {
  createdAt: Date;
  id: string;
  answers: {
    question: {
      id: string;
      correctOption: OPTION;
    };
    id: string;
    option: OPTION;
  }[];
};

const AnswerSheets: NextPageWithLayout = () => {
  const router = useRouter();
  const { code: setCode } = router.query;
  const {
    data: qsSet,
    isLoading,
    isError,
  } = trpc.sets.getFreeTrial.useQuery(
    { code: setCode as string },
    {
      enabled: !!setCode,
      onError: () => {
        toast.error("Something went wrong!");
      },
      onSuccess: (res) => {
        if (!res) {
          router.push("/404");
        }
      },
    }
  );

  const newTestMutation = trpc.sheets.create.useMutation({
    onSuccess: (res) => {
      router.push(`/app/free-trial/${setCode}/sheet/${res.id}?q=1`);
    },
    onError: () => {
      toast.error("Could not start the test. Please try again.");
    },
  });

  const startTest = () => {
    if (!qsSet) return;
    newTestMutation.mutate({ id: qsSet.id });
  };

  const calculateResult = (sheet: SheetType) => {
    const correct = sheet.answers.filter(
      (a) => a.question.correctOption === a.option
    ).length;
    const total = qsSet?.questions.length || 0;
    return {
      label: `${Math.round((100 * correct) / total)}%`,
      value: correct / total,
    };
  };

  return (
    <>
      <Head>
        <title>{qsSet?.title} | Onushilonik</title>
      </Head>
      {isLoading && <LinearProgress />}

      {isError && (
        <Alert
          severity="error"
          title="Something went wrong!"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" onClick={() => window?.location.reload()}>
              Reload
            </Button>
          }
        >
          Could not load the question set. Please try again.
        </Alert>
      )}
      {qsSet && (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {qsSet.title}
          </Typography>
          <Typography variant="h5" component="h2" sx={{ my: 4 }}>
            Your Attampts:
          </Typography>
          <Grid container spacing={2}>
            {qsSet.answerSheets.map((sheet, i) => (
              <Grid item xs={12} sm={6} md={4} key={sheet.id}>
                <Card>
                  <NextLink
                    href={`/app/test/${setCode}/sheet/${sheet.id}?q=1`}
                    passHref
                  >
                    <CardActionArea component="a" sx={{ display: "block" }}>
                      <CardContent sx={{ display: "flex" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography color="textSecondary" variant="h5">
                            Attampt {qsSet.answerSheets.length - i}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {sheet.answers.length} questions answered
                          </Typography>
                          <Typography color="textSecondary">
                            {format(sheet.createdAt, "hh:mm a, dd MMMM yyyy")}
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
          {qsSet.answerSheets.length === 0 && (
            <Typography variant="body2" color={"GrayText"}>
              You have not attempts anything yet. Start now.
            </Typography>
          )}

          {qsSet.answerSheets.length === 0 && (
            <Button
              variant="contained"
              component="a"
              size="large"
              disableElevation
              sx={{ mt: 4 }}
              onClick={startTest}
            >
              Take a test
            </Button>
          )}
        </Container>
      )}
    </>
  );
};

export default AnswerSheets;
