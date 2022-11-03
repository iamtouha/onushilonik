import { useState, useRef } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { toast } from "react-toastify";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { trpc } from "@/utils/trpc";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Paper from "@mui/material/Paper";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import QuestionSetForm from "@/components/QuestionSetForm";
import { SET_TYPE } from "@prisma/client";

type Qs = { code: string; stem: string; id: string };

const NewQuestionSet: NextPageWithLayout = () => {
  const [addedQuestions, setAddedQuestions] = useState<Qs[]>([]);
  const formRef = useRef<HTMLFormElement | null>(null);
  const addSetMutation = trpc.useMutation("admin.sets.add", {
    onSuccess: (data) => {
      if (data) {
        formRef.current?.reset();
        setAddedQuestions([]);
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

  const onDrop = (dragId: string, dropId: string) => {
    setAddedQuestions((questions) => {
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
          <Typography color="inherit">New Question Set</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 4 }}>
          New Question Set
        </Typography>
        <Grid container spacing={4} sx={{ pb: 6 }}>
          <Grid item xs={12} md={6}>
            <QuestionSetForm
              ref={formRef}
              formType="create"
              addedQuestions={addedQuestions}
              setAddedQuestions={setAddedQuestions}
              loading={addSetMutation.isLoading}
              onSubmit={(values) => {
                addSetMutation.mutate({
                  ...values,
                  chapterId:
                    values.type === SET_TYPE.QUESTION_BANK
                      ? values.chapterId
                      : undefined,
                });
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ height: "100%" }}>
            <Paper sx={{ overflowY: "auto", height: 450 }}>
              <DndProvider backend={HTML5Backend}>
                <List dense key={JSON.stringify(addedQuestions)}>
                  {addedQuestions.map((question, i) => (
                    <DraggableListItem
                      question={question}
                      index={i}
                      key={question.code}
                      onDelete={() => {
                        setAddedQuestions(
                          addedQuestions.filter((q) => q.code !== question.code)
                        );
                      }}
                      onDrop={onDrop}
                    />
                  ))}
                  {addedQuestions.length === 0 && (
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
