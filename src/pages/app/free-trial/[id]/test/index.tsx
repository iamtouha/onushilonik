import Head from "next/head";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { trpc } from "@/utils/trpc";
import { useContext, useEffect } from "react";
import PaperWrapper from "@/components/test-paper/PaperWrapper";
import QuestionSkeleton from "@/components/test-paper/QuestionSkeleton";
import { NextPageWithLayout } from "@/pages/_app";
import DefaultLayout from "@/layouts/DefaultLayout";
import SheetContext, { SheetProvider } from "@/contexts/SheetContext";

const TrialQuestionSet: NextPageWithLayout = () => {
  const router = useRouter();
  const { setAnswerSheet, setQuestionSet, setRefetchAnswerSheet } =
    useContext(SheetContext);
  const query = router.query;
  const { isLoading: questionLoading, isError: questionError } = trpc.useQuery(
    ["questionset.trial-set", { id: query.id as string }],
    {
      enabled: !!query.id,
      onSuccess: (data) => {
        if (data) setQuestionSet(data);
      },
    }
  );
  const { isError: sheetError, refetch } = trpc.useQuery(
    ["answersheet.get", { id: query.sheetId as string }],
    {
      enabled: !!query.sheetId,
      onSuccess: (data) => {
        if (data) setAnswerSheet(data);
      },
    }
  );
  useEffect(() => {
    setRefetchAnswerSheet(refetch);
  }, [refetch]);

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
        {<PaperWrapper />}
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
