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
import CircularProgressWithLabel from "@/components/elements/CircularProgressWithLabel";
import BorderedCircularProgress from "@/components/elements/BorderedCircularProgress";

const TrialQuestionSet = () => {
  const router = useRouter();
  const query = router.query;
  const { data, isLoading, isError } = trpc.useQuery(
    ["questionset.trial-set", { id: query.id as string }],
    {
      enabled: !!query.id,
    }
  );

  const newTestMutation = trpc.useMutation("answersheet.create", {
    onError: () => {
      toast.error("Could not start the test. Please try again.");
    },
  });

  const startTest = async () => {
    if (!data?.set) return;
    await newTestMutation
      .mutateAsync({ id: data.set.id })
      .then((res) => {
        router.push(`${router.asPath}/${res.id}`);
      })
      .catch(() => {
        console.log("Error");
      });
  };

  return (
    <>
      <Head>
        <title>Free Trial | Onushilonik</title>
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
      {data?.set && (
        <Container sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {data.set.title}
          </Typography>
          <Typography variant="h5" component="h2" sx={{ my: 4 }}>
            Your Attampts:
          </Typography>
          <Grid container spacing={2}>
            {data.set.answerSheets.map((sheet, i) => (
              <Grid xs={12} sm={6} md={4} key={sheet.id}>
                <NextLink href={`${router.asPath}/${sheet.id}`}>
                  <Card>
                    <CardActionArea>
                      <CardContent sx={{ display: "flex" }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography color="textSecondary" variant="h5">
                            Attampt {data.set.answerSheets.length - i}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {sheet.answers.length} questions answered
                          </Typography>
                          <Typography color="textSecondary">
                            {format(sheet.createdAt, "hh:mm a, dd MMMM yyyy")}
                          </Typography>
                        </Box>
                        <Box>
                          <BorderedCircularProgress
                            color="success"
                            size={80}
                            value={(data.marks[i]?.mark ?? 0) * 100}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </NextLink>
              </Grid>
            ))}
          </Grid>
          {data?.set.answerSheets.length === 0 && (
            <Typography variant="body2" color={"GrayText"}>
              You have not attempts anything yet. Start now.
            </Typography>
          )}
          {data?.set.answerSheets.length === 0 && (
            <NextLink href={`${router.asPath}/take-test`} passHref>
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
            </NextLink>
          )}
        </Container>
      )}
    </>
  );
};

export default TrialQuestionSet;
