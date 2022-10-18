import { useState, useEffect } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useFormik } from "formik";
import * as yup from "yup";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import { SET_TYPE } from "@prisma/client";
import MultipleChipSelect from "@/components/MultipleChipSelect";

interface QuestionSetForm {
  code: string;
  title: string;
  type: SET_TYPE;
  published: boolean;
  trial: boolean;
}
type Qs = { code: string; stem: string; id: string };

const validationSchema = yup.object().shape({
  code: yup.string().min(2).max(100).required("Set Code is required"),
  title: yup.string().min(2).max(255).required("Set Title is required"),
  type: yup
    .mixed()
    .oneOf([Object.values(SET_TYPE)])
    .required("Set type is required"),
  published: yup.boolean(),
  trial: yup.boolean(),
});

const NewQuestionSet: NextPageWithLayout = () => {
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<Qs[]>([]);

  const router = useRouter();
  const { setId } = router.query;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const {
    data: qsSet,
    isLoading,
    isError,
    error,
  } = trpc.useQuery(["admin.sets.getOne", setId as string], {
    enabled: !!setId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      formik.setValues({
        code: data.code,
        title: data.title,
        type: data.type,
        published: data.published,
        trial: data.trial,
      });
      setAllQuestions(
        data.questions.map((q) => ({ code: q.code, stem: q.stem, id: q.id }))
      );
    },
  });

  const { data: subjects } = trpc.useQuery(["admin.subjects.list"], {
    refetchOnWindowFocus: false,
  });
  const { data: chapters } = trpc.useQuery(["admin.chapters.list", subjectId], {
    enabled: !!subjectId,
    refetchOnWindowFocus: false,
  });
  const { data: questions } = trpc.useQuery(
    ["admin.questions.list", chapterId],
    {
      onSuccess: (data) => {
        const selectedQs = allQuestions.map((q) => q.code);
        const thisChapterQuestions = data
          .filter((q) => selectedQs.includes(q.code))
          .map((q) => q.code);
        setSelectedQuestions([...thisChapterQuestions]);
      },
      enabled: !!chapterId,
      refetchOnWindowFocus: false,
    }
  );
  useEffect(() => {
    setChapterId("");
  }, [subjectId]);
  useEffect(() => {
    setSelectedQuestions([]);
  }, [chapterId]);

  const updateSetMutation = trpc.useMutation("admin.sets.update", {
    onSuccess: (data) => {
      if (data) {
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
  const deleteSetMutation = trpc.useMutation("admin.sets.delete", {
    onSuccess: (data) => {
      setConfirmDelete(false);
      if (data) {
        toast.success(`"${data.title}" deleted!`);
        router.push("/dashboard/question-sets");
      }
    },
    onError: (error) => {
      setConfirmDelete(false);
      console.log(error.message);
      toast.error("Could not delete Question Set");
    },
  });
  const formik = useFormik<QuestionSetForm>({
    initialValues: {
      title: "",
      code: "",
      published: true,
      trial: false,
      type: SET_TYPE.MODEL_TEST,
    },
    validationSchema,
    onSubmit: (values) => {
      if (!qsSet) return;

      updateSetMutation.mutate({
        ...values,
        id: qsSet.id,
        questions: allQuestions.map((q) => q.id),
      });
    },
  });

  const addQuestionsToList = () => {
    if (!questions) return;
    setAllQuestions((prev) => {
      const newPrev = prev.filter((qs) => !selectedQuestions.includes(qs.code));
      const newQuestions = questions
        .filter((qs) => selectedQuestions.includes(qs.code))
        .map((qs) => ({ code: qs.code, stem: qs.stem, id: qs.id }));

      return [...newPrev, ...newQuestions];
    });
  };
  const onDrop = (dragId: string, dropId: string) => {
    setAllQuestions((questions) => {
      const dragIndex = questions.findIndex((q) => q.code === dragId);
      const dropIndex = questions.findIndex((q) => q.code === dropId);
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
        <title>New Questions Set | Onushilonik Dashboard</title>
      </Head>
      <Container maxWidth="xl" sx={{ mt: 2 }}>
        <Breadcrumbs sx={{ mb: 1, ml: -1 }} aria-label="breadcrumb">
          <NextLink href="/app" passHref>
            <IconButton component="a">
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
        {isLoading ? (
          <LinearProgress sx={{ mt: 1 }} />
        ) : (
          <Grid container spacing={4} sx={{ pb: 2 }}>
            <Grid item xs={12} md={6}>
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{ mb: 2 }} fullWidth>
                      <InputLabel id="option-select-label">
                        Question Set Type
                      </InputLabel>
                      <Select
                        labelId="option-select-label"
                        name="type"
                        label="Question Set Type"
                        value={formik.values.type}
                        onChange={formik.handleChange}
                      >
                        <MenuItem value="" disabled>
                          Select an option
                        </MenuItem>
                        {Object.values(SET_TYPE).map((option) => (
                          <MenuItem value={option} key={option}>
                            {option.split("_").join(" ")}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Set Code"
                      name="code"
                      value={formik.values.code}
                      onChange={formik.handleChange}
                      fullWidth
                      sx={{ mb: 2 }}
                      error={formik.touched.code && !!formik.errors.code}
                      helperText={formik.touched.code && formik.errors.code}
                    />
                  </Grid>
                </Grid>

                <TextField
                  name="title"
                  label="Set Title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  fullWidth
                  sx={{ mb: 2 }}
                  error={formik.touched.title && !!formik.errors.title}
                  helperText={formik.touched.title && formik.errors.title}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, mx: 2 }}>
                      <FormControlLabel
                        control={
                          <Android12Switch checked={formik.values.published} />
                        }
                        name="published"
                        onChange={formik.handleChange}
                        label="Publish"
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 2, mx: 2 }}>
                      <FormControlLabel
                        control={
                          <Android12Switch checked={formik.values.trial} />
                        }
                        name="trial"
                        onChange={formik.handleChange}
                        label="Free Trial"
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
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
                  <Grid item xs={12} md={6}>
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
                <Box
                  sx={{ mb: 2, display: "flex", gap: 4, alignItems: "start" }}
                >
                  <Box sx={{ flex: 1 }}>
                    <MultipleChipSelect
                      label="Select Questions"
                      disabled={!questions}
                      options={questions?.map(({ code }) => code) || []}
                      selected={selectedQuestions}
                      onChange={setSelectedQuestions}
                    />
                  </Box>

                  <Button
                    sx={{ mt: 2 }}
                    disabled={!selectedQuestions.length}
                    onClick={addQuestionsToList}
                  >
                    Add Questions
                  </Button>
                </Box>
                <LoadingButton
                  loading={updateSetMutation.isLoading}
                  variant="contained"
                  type="submit"
                  size="large"
                >
                  Update Set
                </LoadingButton>
                <LoadingButton
                  sx={{ ml: 2 }}
                  size="large"
                  color="error"
                  onClick={() => setConfirmDelete(true)}
                >
                  {"Delete"}
                </LoadingButton>

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
                <DndProvider backend={HTML5Backend}>
                  <List dense key={JSON.stringify(selectedQuestions)}>
                    {allQuestions.map((question, i) => (
                      <DraggableListItem
                        question={question}
                        index={i}
                        key={question.code}
                        onDelete={() => {
                          setAllQuestions(
                            allQuestions.filter((q) => q.code !== question.code)
                          );
                        }}
                        onDrop={onDrop}
                      />
                    ))}
                    {allQuestions.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary="No questions added yet"
                          secondary="Add questions from the left panel"
                        />
                      </ListItem>
                    )}
                  </List>
                </DndProvider>
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

type ListItemProps = {
  question: Qs;
  index: number;
  onDelete: () => void;
  onDrop: (dragId: string, dropId: string) => void;
};
function DraggableListItem({
  question,
  index,
  onDelete,
  onDrop,
}: ListItemProps) {
  const [collected, drag, dragPreview] = useDrag(() => ({
    type: "list",
    item: { code: question.code },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
  }));
  const [collectedProps, drop] = useDrop<{ code: string }>(() => ({
    accept: "list",
    drop: (item) => {
      if (item.code !== question.code) {
        onDrop(question.code, item.code);
      }
    },
  }));

  return collected.isDragging ? (
    <ListItem ref={dragPreview}>
      <ListItemAvatar></ListItemAvatar>
      <ListItemText
        primary={`${index + 1}) ${question.code}`}
        secondary={
          <span
            title={question.stem}
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {question.stem}
          </span>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  ) : (
    <ListItem ref={drop}>
      <ListItemAvatar>
        <IconButton edge="end" aria-label={"drag & drop"} ref={drag}>
          <DragHandleIcon />
        </IconButton>
      </ListItemAvatar>
      <ListItemText
        primary={`${index + 1}) ${question.code}`}
        secondary={
          <span
            title={question.stem}
            style={{
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
            }}
          >
            {question.stem}
          </span>
        }
      />

      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
