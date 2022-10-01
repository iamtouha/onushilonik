import { useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Unstable_Grid2";
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
import Box from "@mui/material/Box";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import { SET_TYPE } from "@prisma/client";
import MultipleChipSelect from "@/components/MultipleChipSelect";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";

interface QuestionSetForm {
  code: string;
  title: string;
  type: SET_TYPE;
  published: boolean;
}

const validationSchema = yup.object().shape({
  code: yup.string().min(2).max(100).required("Set Code is required"),
  title: yup.string().min(2).max(100).required("Set Title is required"),
  type: yup
    .mixed()
    .oneOf([Object.values(SET_TYPE)])
    .required("Set type is required"),
  published: yup.boolean(),
});

const NewQuestionSet: NextPageWithLayout = () => {
  const [subjectId, setSubjectId] = useState<string>("");
  const [chapterId, setChapterId] = useState<string>("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [allQuestions, setAllQuestions] = useState<
    Array<{ code: string; stem: string }>
  >([]);
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
      enabled: !!chapterId,
      refetchOnWindowFocus: false,
    }
  );

  const addSetMutation = trpc.useMutation("admin.sets.add", {
    onSuccess: (data) => {
      if (data) {
        toast.success(`${data.code} added!`);
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
  const formik = useFormik<QuestionSetForm>({
    initialValues: {
      title: "",
      code: "",
      published: true,
      type: SET_TYPE.MODEL_TEST,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!chapterId.length) {
        toast.warn("Select a chapter");
        return;
      }
      await addSetMutation
        .mutateAsync({ ...values, questions: selectedQuestions })
        .then(() => resetForm())
        .catch((error) => console.error(error.message));
    },
  });

  const addQuestionsToList = () => {
    if (!questions) return;
    setAllQuestions((prev) => {
      const newPrev = prev.filter((qs) => !selectedQuestions.includes(qs.code));
      const newQuestions = questions
        .filter((qs) => selectedQuestions.includes(qs.code))
        .map((qs) => ({ code: qs.code, stem: qs.stem }));

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

  return (
    <>
      <Head>
        <title>New Questions Set | Onushilonik Dashboard</title>
      </Head>
      <Container sx={{ mt: 2 }}>
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
          <Typography color="inherit">New Question Set</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          New Question Set
        </Typography>
        <Grid container>
          <Grid xs={12} md={6} sx={{ pb: 10 }}>
            <Box component="form" onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid xs={12} md={6}>
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
                <Grid xs={12} md={6}>
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
              <Box sx={{ mb: 2, display: "flex", gap: 4, alignItems: "start" }}>
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
                loading={addSetMutation.isLoading}
                variant="contained"
                type="submit"
                size="large"
              >
                Create New Set
              </LoadingButton>
            </Box>
          </Grid>
          <Grid xs={12} md={6} sx={{ px: 2, height: "100%" }}>
            <Paper sx={{ overflowY: "auto", height: 480 }}>
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
      </Container>
    </>
  );
};

NewQuestionSet.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default NewQuestionSet;

type ListItemProps = {
  question: { stem: string; code: string };
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
        secondary={question.stem}
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
        secondary={question.stem}
      />

      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
}
