import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { trpc } from "@/utils/trpc";
import QuestionSheet from "@/components/QuestionSheet";
import { useContext, useEffect } from "react";
import ModelTest from "@/components/ModelTest";
import QuestionSkeleton from "@/components/QuestionSkeleton";
import { NextPageWithLayout } from "@/pages/_app";
import DefaultLayout from "@/layouts/DefaultLayout";
import SheetContext, { SheetProvider } from "@/contexts/SheetContext";

const TrialQuestionSet: NextPageWithLayout = () => {
  const router = useRouter();
  const { setAnswerSheet, setQuestionSet } = useContext(SheetContext);
  const query = router.query;
  const { isLoading: questionLoading, isError: questionError } = trpc.useQuery(
    ["questionset.trial-set", { id: query.id as string }],
    {
      enabled: !!query.id,
      onSuccess: (data) => {
        if (data) setQuestionSet(data.set);
      },
    }
  );
  const { isError: sheetError } = trpc.useQuery(
    ["answersheet.get", { id: query.sheetId as string }],
    {
      enabled: !!query.sheetId,
      onSuccess: (data) => {
        if (data) setAnswerSheet(data);
      },
    }
  );
  return (
    <>
      <Head>
        <title>Free Trial | Onushilonik</title>
      </Head>
      {questionLoading && <QuestionSkeleton />}

      <Container>
        {questionError && (
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
        {sheetError && (
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
            Could not load the your answers. Please try again.
          </Alert>
        )}
        {<ModelTest />}
      </Container>
    </>
  );
};

TrialQuestionSet.getLayout = (page) => (
  <DefaultLayout>
    <SheetProvider>{page}</SheetProvider>
  </DefaultLayout>
);

export default TrialQuestionSet;
