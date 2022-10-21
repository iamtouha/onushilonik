import { useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { OPTION } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { Question } from "./QuestionSkeleton";
import SheetContext from "@/contexts/SheetContext";

export default function QuestionSheet() {
  const router = useRouter();
  const order = Number(router.query.q);
  const { questionSet, answerSheet } = useContext(SheetContext);
  const questions = useMemo(
    () => questionSet?.questions ?? [],
    [JSON.stringify(questionSet?.questions)]
  );
  const [selectedQuestion, setSelectedQuestion] = useState<string>();
  const {
    data: question,
    isLoading,
    isError,
  } = trpc.useQuery(["question.get", { id: selectedQuestion ?? "" }], {
    enabled: !!selectedQuestion,
  });

  useEffect(() => {
    if (!order) return;
    const selected = questions.find((q) => q.order === order);
    if (selected) {
      setSelectedQuestion(selected.question.id);
    }
  }, [order, JSON.stringify(questions)]);

  const navigation = useMemo(
    () => ({
      next: questions.find((q) => q.order === order + 1)?.order,
      prev: questions.find((q) => q.order === order - 1)?.order,
    }),
    [order, JSON.stringify(questions)]
  );
  const navigateTo = (order: number) => {
    router.push(
      { pathname: router.pathname, query: { ...router.query, q: order } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <Box>
      <Grid container spacing={{ xs: 2, md: 6 }}>
        <Grid item xs={12} md={8} order={{ xs: 2, md: 1 }}>
          {isError && (
            <Alert
              severity="error"
              title="Something went wrong!"
              sx={{ mt: 2 }}
              action={
                <Button
                  color="inherit"
                  onClick={() => window?.location.reload()}
                >
                  Reload
                </Button>
              }
            >
              Could not load the question set. Please try again.
            </Alert>
          )}
          {isLoading && <Question />}
          {question && (
            <Box sx={{ my: 2 }}>
              <Typography variant="body1" component="p" gutterBottom>
                {question.stem}
              </Typography>
              <FormControl sx={{ mt: 2 }}>
                <FormLabel
                  id="option-group-input-label"
                  sx={{ color: "inherit" }}
                >
                  Select the correct option
                </FormLabel>
                <RadioGroup
                  aria-labelledby="option-group-input-label"
                  name="option-buttons-group"
                >
                  <FormControlLabel
                    value={OPTION.A}
                    control={<Radio />}
                    label={question.optionA}
                  />
                  <FormControlLabel
                    value={OPTION.B}
                    control={<Radio />}
                    label={question.optionB}
                  />
                  <FormControlLabel
                    value={OPTION.C}
                    control={<Radio />}
                    label={question.optionC}
                  />
                  <FormControlLabel
                    value={OPTION.D}
                    control={<Radio />}
                    label={question.optionD}
                  />
                </RadioGroup>
              </FormControl>
              <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                <Button size="large" variant={"outlined"} disableElevation>
                  Submit answer
                </Button>
                <div style={{ marginRight: 0, marginLeft: "auto" }} />
                <IconButton
                  color="primary"
                  disabled={!navigation.prev}
                  onClick={() => navigateTo(navigation.prev ?? 0)}
                >
                  <ArrowBackIcon />
                </IconButton>
                <IconButton
                  color="primary"
                  disabled={!navigation.next}
                  onClick={() => navigateTo(navigation.next ?? 0)}
                >
                  <ArrowForwardIcon />
                </IconButton>
              </Box>
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={4} order={{ xs: 1, md: 2 }}>
          <Typography variant="body1" component="p" gutterBottom>
            Question {order} of {questions.length}
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {questions.map((q) => (
              <Button
                variant="outlined"
                color="inherit"
                key={q.question.id}
                disabled={q.order === order}
                onClick={() => navigateTo(q.order)}
              >
                {q.order}
              </Button>
            ))}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
