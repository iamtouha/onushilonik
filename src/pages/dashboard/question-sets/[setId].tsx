import { useState, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import HomeIcon from "@mui/icons-material/Home";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import QuestionSetForm from "@/components/QuestionSetForm";
import { SET_TYPE } from "@prisma/client";
import dynamic from "next/dynamic";

const OrderList = dynamic(() => import("@/components/OrderList"), {
  ssr: false,
});

type Qs = { code: string; stem: string; id: string };

const NewQuestionSet: NextPageWithLayout = () => {
  const [addedQuestions, setAddedQuestions] = useState<Qs[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const router = useRouter();
  const { setId } = router.query;
  const {
    data: qsSet,
    isLoading,
    isError,
    error,
  } = trpc.admin.questionSets.getOne.useQuery(setId as string, {
    enabled: !!setId,
    refetchOnWindowFocus: false,
  });

  const updateSetMutation = trpc.admin.questionSets.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        formRef.current?.reset();
        toast.success(`${data.code} updated!`);
        router.push("/dashboard/question-sets");
      }
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("Question with this code already exists");
        return;
      }
      if (error.data?.code === "BAD_REQUEST") {
        toast.error("Invalid form data");
        return;
      }
      toast.error("Something went wrong");
    },
  });
  const deleteSetMutation = trpc.admin.questionSets.delete.useMutation({
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`"${data.title}" deleted!`);
        router.push("/dashboard/question-sets");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.error(error.message);
      toast.error("Could not delete Question Set");
    },
  });

  const reOrder = (id: string, dir: "up" | "down") => {
    setAddedQuestions((questions) => {
      const dragIndex = questions.findIndex((q) => q.id === id);
      const dropIndex = dir === "up" ? dragIndex - 1 : dragIndex + 1;
      console.log(dragIndex, dropIndex);

      const newQuestions = [...questions];
      const dragQs = newQuestions[dragIndex];
      const dropQs = newQuestions[dropIndex];
      if (!dropQs || !dragQs) {
        return questions;
      }
      newQuestions[dragIndex] = dropQs;
      newQuestions[dropIndex] = dragQs;
      return newQuestions;
    });
  };

  const deleteSet = () => {
    if (!qsSet) return;
    deleteSetMutation.mutate(qsSet.id);
  };

  return (
    <>
      <Head>
        <title>{qsSet?.title ?? "Question Set"} | Onushilonik Dashboard</title>
      </Head>
      {isLoading && <LinearProgress />}
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app">
            <IconButton>
              <HomeIcon />
            </IconButton>
          </NextLink>
          <Link href="/dashboard" underline="hover" color="inherit">
            Dashboard
          </Link>
          <Link
            href="/dashboard/question-sets"
            underline="hover"
            color="inherit"
          >
            Question Sets
          </Link>
          <Typography color="inherit">
            {qsSet?.title ?? "Question Set"}
          </Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          {qsSet?.title ?? "Question Set"}
        </Typography>
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        {qsSet && (
          <Grid container spacing={4} sx={{ pb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box>
                <QuestionSetForm
                  ref={formRef}
                  formType="update"
                  questionSet={qsSet}
                  addedQuestions={addedQuestions}
                  loading={updateSetMutation.isLoading}
                  onDelete={() => setConfirmDelete(true)}
                  setAddedQuestions={setAddedQuestions}
                  onSubmit={(values) => {
                    updateSetMutation.mutate({
                      id: qsSet.id,
                      title: values.title,
                      type: values.type,
                      chapterId:
                        values.type === SET_TYPE.QUESTION_BANK
                          ? values.chapterId
                          : undefined,
                      duration: values.duration,
                      questions: values.questions,
                      published: values.published,
                      trial: values.trial,
                    });
                  }}
                ></QuestionSetForm>
                {qsSet?.createdAt && (
                  <Typography
                    sx={{ mt: 4 }}
                    variant="body2"
                    color={"GrayText"}
                    gutterBottom
                  >
                    Created at {format(qsSet.createdAt, "hh:mm a, dd/MM/yyyy")}{" "}
                    by {qsSet?.createdBy?.name ?? "Unknown"}
                  </Typography>
                )}
                {qsSet?.updatedBy && (
                  <Typography variant="body2" color={"GrayText"} gutterBottom>
                    Last updated at{" "}
                    {format(qsSet.updatedAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                    {qsSet.updatedBy.name ?? "Unknown"}
                  </Typography>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ height: "100%" }}>
              <Paper sx={{ overflowY: "auto", height: 450 }}>
                <OrderList
                  items={addedQuestions}
                  onRemove={(id) =>
                    setAddedQuestions(addedQuestions.filter((q) => q.id !== id))
                  }
                  moveUp={(id) => reOrder(id, "up")}
                  moveDown={(id) => reOrder(id, "down")}
                />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete subject"
        aria-describedby="confirm delete subject"
      >
        <DialogTitle>{`Delete "${qsSet?.title}"?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this subject? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            onClick={deleteSet}
            loading={deleteSetMutation.isLoading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

NewQuestionSet.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default NewQuestionSet;
