import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from "react";
import { useFormik } from "formik";
import * as yup from "yup";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import { QuestionSet, SET_TYPE } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { Android12Switch } from "@/components/CustomComponents";
import MultipleChipSelect from "@/components/MultipleChipSelect";

type Qs = { code: string; stem: string; id: string };
interface QuestionSetFormFields {
  code: string;
  title: string;
  type: SET_TYPE;
  published: boolean;
  trial: boolean;
  duration: number;
}
interface QuestionSetFields extends QuestionSetFormFields {
  questions: string[];
  chapterId: string;
  subjectId: string;
}

interface QuestionSetFormProps {
  questionSet?: QuestionSet & {
    questions: {
      code: string;
      id: string;
      stem: string;
    }[];
  };
  loading: boolean;
  addedQuestions: Qs[];
  formType: "create" | "update";
  setAddedQuestions: Dispatch<SetStateAction<Qs[]>>;
  onSubmit: (values: QuestionSetFields) => void;
  onDelete?: () => void;
}

const validationSchema = yup.object().shape({
  code: yup.string().min(2).max(100).required("Set Code is required"),
  title: yup.string().min(2).max(255).required("Set Title is required"),
  type: yup
    .mixed()
    .oneOf([Object.values(SET_TYPE)])
    .required("Set type is required"),
  published: yup.boolean(),
  trial: yup.boolean(),
  duration: yup.number().min(0).max(3600).required("Duration is required"),
});

type FormRef = {
  reset: () => void;
};

const QuestionSetForm = forwardRef<FormRef, QuestionSetFormProps>(
  (props, ref) => {
    const [subjectId, setSubjectId] = useState<string>("");
    const [chapterId, setChapterId] = useState<string>("");
    const [qsType, setQsType] = useState<SET_TYPE>(SET_TYPE.MODEL_TEST);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);

    const { data: subjects } = trpc.admin.subjects.list.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });
    const { data: chapters } = trpc.admin.chapters.list.useQuery(subjectId, {
      enabled: !!subjectId,
      refetchOnWindowFocus: false,
    });
    const { data: questions } = trpc.admin.questions.list.useQuery(chapterId, {
      onSuccess: (data) => {
        const selectedQs = props.addedQuestions.map((q) => q.code);
        const thisChapterQuestions = data
          .filter((q) => selectedQs.includes(q.code))
          .map((q) => q.code);
        setSelectedQuestions([...thisChapterQuestions]);
      },
      enabled: !!chapterId,
      refetchOnWindowFocus: false,
    });

    const addQuestionsToList = () => {
      if (!questions) return;
      props.setAddedQuestions((prev) => {
        const newPrev = prev.filter(
          (qs) => !selectedQuestions.includes(qs.code)
        );
        const newQuestions = questions
          .filter((qs) => selectedQuestions.includes(qs.code))
          .map((qs) => ({ code: qs.code, stem: qs.stem, id: qs.id }));
        return [...newPrev, ...newQuestions];
      });
    };

    useEffect(() => {
      setChapterId("");
    }, [subjectId]);
    useEffect(() => {
      setSelectedQuestions([]);
    }, [chapterId]);
    useEffect(() => {
      if (!props.questionSet) {
        return;
      }
      const { code, title, type, published, trial, duration, questions } =
        props.questionSet;
      formik.setValues({ code, title, type, published, trial, duration });
      props.setAddedQuestions(
        questions.map((q) => ({ code: q.code, stem: q.stem, id: q.id }))
      );
    }, [JSON.stringify(props.questionSet)]);
    useEffect(() => {
      if (qsType === SET_TYPE.QUESTION_BANK) {
        props.setAddedQuestions([]);
      }
    }, [qsType, chapterId]);

    const formik = useFormik<QuestionSetFormFields>({
      initialValues: {
        title: "",
        code: "",
        published: true,
        trial: false,
        type: SET_TYPE.MODEL_TEST,
        duration: 0,
      },
      validationSchema,
      onSubmit: (values) => {
        props.onSubmit({
          ...values,
          subjectId,
          chapterId,
          questions: props.addedQuestions.map((q) => q.id),
        });
      },
    });

    useImperativeHandle(ref, () => ({
      reset: () => formik.resetForm(),
    }));

    return (
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
                onChange={(e) => {
                  setQsType(e.target.value as SET_TYPE);
                  formik.handleChange(e);
                }}
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
              disabled={props.formType === "update"}
              onChange={formik.handleChange}
              fullWidth
              sx={{ mb: 2 }}
              error={formik.touched.code && !!formik.errors.code}
              helperText={formik.touched.code && formik.errors.code}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={8}>
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
          </Grid>
          <Grid item xs={4}>
            <TextField
              name="duration"
              type={"number"}
              label="Duration (in minutes)"
              value={formik.values.duration}
              onChange={formik.handleChange}
              disabled={formik.values.type === SET_TYPE.QUESTION_BANK}
              fullWidth
              sx={{ mb: 2 }}
              error={formik.touched.duration && !!formik.errors.duration}
              helperText={formik.touched.duration && formik.errors.duration}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2, mx: 2 }}>
              <FormControlLabel
                control={<Android12Switch checked={formik.values.published} />}
                name="published"
                onChange={formik.handleChange}
                label="Publish"
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2, mx: 2 }}>
              <FormControlLabel
                control={<Android12Switch checked={formik.values.trial} />}
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
              <InputLabel id="subject-select-label">Select Subject</InputLabel>
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
              <InputLabel id="chapter-select-label">Select Chapter</InputLabel>
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
          loading={props.loading}
          variant="contained"
          type="submit"
          size="large"
        >
          {props.questionSet ? "Update Set" : "New Question Set"}
        </LoadingButton>
        {props.onDelete && (
          <Button
            sx={{ ml: 2 }}
            size="large"
            color="error"
            onClick={props.onDelete}
          >
            {"Delete"}
          </Button>
        )}
      </Box>
    );
  }
);
QuestionSetForm.displayName = "QuestionSetForm";
export default QuestionSetForm;
