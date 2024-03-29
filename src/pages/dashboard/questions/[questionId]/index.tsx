import React, { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { OPTION } from "@prisma/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import LoadingButton from "@mui/lab/LoadingButton";
import HomeIcon from "@mui/icons-material/Home";
import Box from "@mui/material/Box";
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";

interface UpdateQuestionForm {
  stem: string;
  published: boolean;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OPTION;
  noteId?: string;
}

const validationSchema = yup.object().shape({
  stem: yup.string().min(2).max(1024).required("Stem is required"),
  optionA: yup.string().min(1).max(100).required("Option A cannot be empty"),
  optionB: yup.string().min(1).max(100).required("Option B cannot be empty"),
  optionC: yup.string().min(1).max(100).required("Option C cannot be empty"),
  optionD: yup.string().min(1).max(100).required("Option D cannot be empty"),
  correctOption: yup
    .mixed()
    .oneOf([OPTION.A, OPTION.B, OPTION.C, OPTION.D])
    .required("Correct Option is required"),
  published: yup.boolean(),
  noteId: yup.string().optional(),
});

const Question: NextPageWithLayout = () => {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    data: question,
    isLoading,
    isError,
    error,
  } = trpc.admin.questions.getOne.useQuery(router.query.questionId as string, {
    enabled: !!router.query.questionId,
    refetchOnWindowFocus: false,
    onSuccess(data) {
      if (data) {
        setSubjectId(data.chapter.subjectId);
        setChapterId(data.chapter.id);
      }
    },
  });
  const deleteQuestionMutation = trpc.admin.questions.delete.useMutation({
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`"${data.code}" deleted!`);
        router.push("/dashboard/questions");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.error(error.message);
      toast.error("Could not delete question");
    },
  });
  const { data: subjects } = trpc.admin.subjects.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: chapters } = trpc.admin.chapters.list.useQuery(subjectId, {
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
  });
  const { data: notes } = trpc.admin.notes.list.useQuery(chapterId, {
    enabled: !!chapterId,
    refetchOnWindowFocus: false,
  });
  const updateQuestionMutation = trpc.admin.questions.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.code} added!`);
        router.push("/dashboard/questions");
      }
    },
    onError: (error) => {
      console.error(error.message);

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
  const formik = useFormik<UpdateQuestionForm>({
    initialValues: {
      stem: question?.stem || "",
      published: question?.published || false,
      optionA: question?.optionA || "",
      optionB: question?.optionB || "",
      optionC: question?.optionC || "",
      optionD: question?.optionD || "",
      correctOption: question?.correctOption || OPTION.A,
      noteId: question?.noteId || undefined,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (!question) return;
      if (!chapterId.length) {
        toast.warn("Select a chapter");
        return;
      }
      updateQuestionMutation.mutate({ ...values, chapterId, id: question.id });
    },
  });

  const deleteQuestion = () => {
    if (!question) return;
    deleteQuestionMutation.mutate(question.id);
  };

  return (
    <>
      <Head>
        <title>Add Question | Onushilonik Dashboard</title>
      </Head>
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
          <Link href="/dashboard/questions" underline="hover" color="inherit">
            Questions
          </Link>
          <Typography color="inherit">{question?.code}</Typography>
        </Breadcrumbs>
        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        {question && (
          <>
            <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
              {`Question "${question?.code}"`}
            </Typography>

            <Box
              component="form"
              onSubmit={formik.handleSubmit}
              sx={{ maxWidth: 960 }}
            >
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <FormControl sx={{ mb: 2 }} fullWidth>
                    <InputLabel id="subject-select-label">
                      Select Subject
                    </InputLabel>
                    <Select
                      labelId="subject-select-label"
                      name="subjectId"
                      value={subjectId}
                      label="Select Subject"
                      onChange={(e) => setSubjectId(e.target.value as string)}
                    >
                      <MenuItem value="" disabled>
                        Select an option
                      </MenuItem>
                      {subjects?.map((subject) => (
                        <MenuItem key={subject.id} value={subject.id}>
                          {subject.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl disabled={!chapters} sx={{ mb: 2 }} fullWidth>
                    <InputLabel id="chapter-select-label">
                      Select Chapter
                    </InputLabel>
                    <Select
                      labelId="chapter-select-label"
                      name="chapterId"
                      value={chapterId}
                      label="Select Chapter"
                      onChange={(e) => setChapterId(e.target.value as string)}
                    >
                      <MenuItem value="" disabled>
                        Select an option
                      </MenuItem>
                      {chapters?.map((chapter) => (
                        <MenuItem key={chapter.id} value={chapter.id}>
                          {chapter.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <TextField
                label="Question Code"
                value={question?.code}
                fullWidth
                sx={{ mb: 2 }}
                disabled
              />
              <TextField
                name="stem"
                label="Question"
                value={formik.values.stem}
                multiline
                rows={3}
                onChange={formik.handleChange}
                fullWidth
                sx={{ mb: 2 }}
                error={formik.touched.stem && !!formik.errors.stem}
                helperText={formik.touched.stem && formik.errors.stem}
              />
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField
                    name="optionA"
                    label="Option A"
                    value={formik.values.optionA}
                    onChange={formik.handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={formik.touched.optionA && !!formik.errors.optionA}
                    helperText={formik.touched.optionA && formik.errors.optionA}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="optionB"
                    label="Option B"
                    value={formik.values.optionB}
                    onChange={formik.handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={formik.touched.optionB && !!formik.errors.optionB}
                    helperText={formik.touched.optionB && formik.errors.optionB}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <TextField
                    name="optionC"
                    label="Option C"
                    value={formik.values.optionC}
                    onChange={formik.handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={formik.touched.optionC && !!formik.errors.optionC}
                    helperText={formik.touched.optionC && formik.errors.optionC}
                  />
                </Grid>
                <Grid xs={12} md={6}>
                  <TextField
                    name="optionD"
                    label="Option D"
                    value={formik.values.optionD}
                    onChange={formik.handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                    error={formik.touched.optionD && !!formik.errors.optionD}
                    helperText={formik.touched.optionD && formik.errors.optionD}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
                  <FormControl sx={{ mb: 2 }} fullWidth>
                    <InputLabel id="option-select-label">
                      Correct Option
                    </InputLabel>
                    <Select
                      labelId="option-select-label"
                      name="correctOption"
                      label="Correct Option"
                      value={formik.values.correctOption}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="" disabled>
                        Select an option
                      </MenuItem>
                      {Object.values(OPTION).map((option) => (
                        <MenuItem value={option} key={option}>
                          {`Option ${option}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={12} md={6}>
                  <FormControl sx={{ mb: 2 }} fullWidth>
                    <InputLabel id="option-note-label">Select Note</InputLabel>
                    <Select
                      labelId="option-note-label"
                      name="noteId"
                      label="Correct Option"
                      value={formik.values.noteId}
                      onChange={formik.handleChange}
                    >
                      <MenuItem value="" disabled>
                        Select an option
                      </MenuItem>
                      {notes?.map((option) => (
                        <MenuItem value={option.id} key={option.code}>
                          {`${option.code}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Android12Switch checked={formik.values.published} />
                  }
                  name="published"
                  onChange={formik.handleChange}
                  label="Publish"
                />
              </Box>

              <LoadingButton
                loading={updateQuestionMutation.isLoading}
                variant="contained"
                type="submit"
                size="large"
              >
                Update Question
              </LoadingButton>
              <Button
                sx={{ ml: 2 }}
                size="large"
                color="error"
                onClick={() => setConfirmDelete(true)}
              >
                {"Delete"}
              </Button>
            </Box>
            <Typography
              sx={{ mt: 4 }}
              variant="body2"
              color={"GrayText"}
              gutterBottom
            >
              Created at {format(question.createdAt, "hh:mm a, dd/MM/yyyy")} by{" "}
              {question.createdBy?.name ?? "Unknown"}
            </Typography>
            {question.updatedBy && (
              <Typography variant="body2" color={"GrayText"} gutterBottom>
                Last updated at{" "}
                {format(question.updatedAt, "hh:mm a, dd/MM/yyyy")} by{" "}
                {question.updatedBy.name ?? "Unknown"}
              </Typography>
            )}
            <Box sx={{ pb: 10 }} />
          </>
        )}
      </Container>
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        aria-labelledby="delete chapter"
        aria-describedby="confirm delete chapter"
      >
        <DialogTitle>{`Delete Question "${question?.code}"?`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <LoadingButton
            color="error"
            onClick={deleteQuestion}
            loading={deleteQuestionMutation.isLoading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

Question.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Question;
