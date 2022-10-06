import Head from "next/head";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import * as yup from "yup";
import { useFormik } from "formik";
import { PAYMENT_METHOD } from "@prisma/client";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const SUBSCRIPTION_PRICE = 200;

const validationSchema = yup.object({
  phoneNumber: yup
    .string()
    .required("Phone number is required")
    .matches(/^[0-9]+$/, "Phone number must be only digits")
    .min(10, "Phone number must be at least 10 digits")
    .max(14, "Account number must be at most 14 digits"),
  method: yup
    .mixed()
    .oneOf([Object.values(PAYMENT_METHOD)])
    .required("Payment method is required"),
  paymentId: yup
    .string()
    .required("Account number is required")
    .matches(/^[0-9]+$/, "Account number must be only digits")
    .min(10, "Account number must be at least 10 digits")
    .max(14, "Account number must be at most 14 digits"),

  transactionId: yup
    .string()
    .required("Transaction ID is required")
    .min(10, "Transaction ID must be at least 10 digits")
    .max(50, "Transaction ID must be at most 50 digits"),
});

const Subscribe = () => {
  const router = useRouter();
  const { data: session } = useSession();
  trpc.useQuery(["subscription.get"], {
    enabled: !!session?.user,
    onSuccess: (data) => {
      if (data) {
        formik.setFieldValue("phoneNum", data.phoneNumber);
      }
    },
  });
  const createSubscription = trpc.useMutation("subscription.create", {
    onSuccess: () => {
      toast.success(
        "আপনার সাবস্ক্রিপশন সফলভাবে সংরক্ষিত হয়েছে। দয়া করে ভেরিফিকেশনের জন্য অপেক্ষা করুন।"
      );
      router.push("/app/account");
    },
    onError: (err) => {
      console.error(err);
      toast.error(
        "সাবস্ক্রিপশন সংরক্ষণ করতে অসমর্থ। দয়া করে আবার চেষ্টা করুন।"
      );
    },
  });

  const formik = useFormik({
    initialValues: {
      phoneNumber: "",
      method: "",
      paymentId: "",
      transactionId: "",
    },
    validationSchema,
    onSubmit: (values) => {
      createSubscription.mutate({
        phoneNumber: values.phoneNumber,
        method: values.method as PAYMENT_METHOD,
        paymentId: values.paymentId,
        transactionId: values.transactionId,
      });
    },
  });

  return (
    <>
      <Head>
        <title>Subscribe | Onushilonik</title>
      </Head>
      <Container>
        <Box sx={{ mt: 4 }}>
          <Grid container spacing={4}>
            <Grid order={{ xs: 2, md: 1 }} item xs={12} md={6}>
              <Typography gutterBottom variant="h5" component="h2">
                {"সাবস্ক্রাইব করুন"}
              </Typography>
              <Box
                component="form"
                sx={{ mt: 4 }}
                onSubmit={formik.handleSubmit}
              >
                <TextField
                  label="মোবাইল নং"
                  name="phoneNumber"
                  sx={{ mb: 2 }}
                  onChange={formik.handleChange}
                  value={formik.values.phoneNumber}
                  error={
                    formik.touched.phoneNumber && !!formik.errors.phoneNumber
                  }
                  helperText={
                    formik.touched.phoneNumber && formik.errors.phoneNumber
                  }
                  fullWidth
                ></TextField>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl sx={{ mb: 2 }} fullWidth>
                      <InputLabel id="option-select-label">
                        পেমেন্ট মেথড
                      </InputLabel>
                      <Select
                        labelId="option-select-label"
                        name="method"
                        sx={{ textTransform: "capitalize" }}
                        label="পেমেন্ট মেথড"
                        value={formik.values.method}
                        onChange={formik.handleChange}
                        error={formik.touched.method && !!formik.errors.method}
                      >
                        <MenuItem value="" disabled>
                          Select an option
                        </MenuItem>
                        {Object.values(PAYMENT_METHOD).map((option) => (
                          <MenuItem
                            sx={{ textTransform: "capitalize" }}
                            value={option}
                            key={option}
                          >
                            {option.toLowerCase()}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText error>
                        {formik.touched.method && formik.errors.method}
                      </FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
                <TextField
                  label="পেমেন্ট একাউন্ট নং"
                  name="paymentId"
                  sx={{ mb: 2 }}
                  onChange={formik.handleChange}
                  value={formik.values.paymentId}
                  error={formik.touched.paymentId && !!formik.errors.paymentId}
                  helperText={
                    formik.touched.paymentId && formik.errors.paymentId
                  }
                  fullWidth
                ></TextField>
                <TextField
                  label="ট্রানজেকশন আইডি"
                  name="transactionId"
                  sx={{ mb: 2 }}
                  onChange={formik.handleChange}
                  value={formik.values.transactionId}
                  error={
                    formik.touched.transactionId &&
                    !!formik.errors.transactionId
                  }
                  helperText={
                    formik.touched.transactionId && formik.errors.transactionId
                  }
                  fullWidth
                ></TextField>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  size="large"
                  sx={{ mt: 3 }}
                  loading={createSubscription.isLoading}
                >
                  সাবস্ক্রাইব
                </LoadingButton>
              </Box>
            </Grid>
            <Grid order={{ xs: 1, md: 2 }} item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography sx={{ mb: 2 }} variant="h6" component="h2">
                    {"সাবস্ক্রিপশন প্ল্যান"}
                  </Typography>
                  <Typography gutterBottom variant="body1">
                    {"সাবস্ক্রিপশন ফিঃ ২০০ টাকা প্রতি মাস।"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {
                      "সাবস্ক্রিপশন শেষ হওয়ার পর আপনি আবার সাবস্ক্রাইব করতে পারবেন।"
                    }
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {"পেমেন্ট মেথড"}
                  </Typography>
                  <Typography
                    sx={{ mb: 2 }}
                    gutterBottom
                    variant="body2"
                    color={"text.secondary"}
                  >
                    {"পেমেন্ট এর জন্য সেন্ড মানি অপশন ব্যবহার করুন।"}
                  </Typography>
                  <Typography gutterBottom variant="body1">
                    {"বিকাশঃ ০১২৩৪৫৬৭৮৯০"}
                  </Typography>
                  <Typography gutterBottom variant="body1">
                    {"রকেটঃ ০১২৩৪৫৬৭৮৯০"}
                  </Typography>
                  <Typography variant="body1">{"নগদঃ ০১২৩৪৫৬৭৮৯০"}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};
export default Subscribe;
