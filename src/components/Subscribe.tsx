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
import { PAYMENT_METHOD, PLAN } from "@prisma/client";
import { useSession } from "next-auth/react";
import { trpc } from "@/utils/trpc";

type MakePaymentFields = {
  paymentId: string;
  transactionId: string;
  method: PAYMENT_METHOD | "";
};

const validationSchema = yup.object({
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
  const { status } = useSession({ required: true });
  const makePaymentMutation = trpc.user.makePayment.useMutation();
  const formik = useFormik<MakePaymentFields>({
    initialValues: {
      method: "",
      paymentId: "",
      transactionId: "",
    },
    validationSchema,
    onSubmit: (values) => {
      makePaymentMutation.mutate({
        method: values.method || PAYMENT_METHOD.BKASH,
        paymentId: values.paymentId,
        transactionId: values.transactionId,
        plan: PLAN.MONTHLY,
      });
    },
  });
  if (status === "loading") {
    return <>loading..</>;
  }
  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid order={{ xs: 2, md: 1 }} item xs={12} md={6}>
          <Typography gutterBottom variant="h5" component="h2">
            Subscribe Now
          </Typography>
          <Box component="form" sx={{ mt: 4 }} onSubmit={formik.handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl sx={{ mb: 2 }} fullWidth>
                  <InputLabel id="option-select-label">
                    Payment Method
                  </InputLabel>
                  <Select
                    labelId="option-select-label"
                    name="method"
                    sx={{ textTransform: "capitalize" }}
                    label="Payment Method"
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
              label="Account/Phone Number"
              name="paymentId"
              sx={{ mb: 2 }}
              onChange={formik.handleChange}
              value={formik.values.paymentId}
              error={formik.touched.paymentId && !!formik.errors.paymentId}
              helperText={formik.touched.paymentId && formik.errors.paymentId}
              fullWidth
            ></TextField>
            <TextField
              label="Transaction ID"
              name="transactionId"
              sx={{ mb: 2 }}
              onChange={formik.handleChange}
              value={formik.values.transactionId}
              error={
                formik.touched.transactionId && !!formik.errors.transactionId
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
              loading={makePaymentMutation.isLoading}
            >
              Subscribe
            </LoadingButton>
          </Box>
        </Grid>
        <Grid order={{ xs: 1, md: 2 }} item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography sx={{ mb: 2 }} variant="h6" component="h2">
                {"Subscription Plan"}
              </Typography>
              <Typography gutterBottom variant="body1">
                {"Subscription Fee: only 200 BDT per month"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {"You can renew your subscription anytime."}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" component="h2">
                {"Payment Method"}
              </Typography>
              <Typography
                sx={{ mb: 2 }}
                gutterBottom
                variant="body2"
                color={"text.secondary"}
              >
                {'Please use "send money" option for payment'}
              </Typography>
              <Typography gutterBottom variant="body1">
                {"bKash: 01234567890"}
              </Typography>
              <Typography gutterBottom variant="body1">
                {"DBBL Rocket: 01234567890"}
              </Typography>
              <Typography variant="body1">{"Nagad: 01234567890"}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Subscribe;
