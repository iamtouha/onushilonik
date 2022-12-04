import { trpc } from "@/utils/trpc";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import LoadingButton from "@mui/lab/LoadingButton";
import { useSession } from "next-auth/react";
import Chip from "@mui/material/Chip";
import Head from "next/head";
import MuiTable from "@/components/MuiTable";
import { format } from "date-fns";
import { PAYMENT_STATUS } from "@prisma/client";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useFormik } from "formik";

type UpdateProfileFields = {
  fullName: string;
  phone: string;
  institute: string;
};

const validationSchema = yup.object().shape({
  fullName: yup.string().min(4).max(100).required("Your full name is required"),
  phone: yup
    .string()
    .min(11)
    .max(15)
    .matches(/^[0-9]+$/, "Phone number can only contain numbers")
    .required("Your phone number is required"),
  institute: yup.string().min(4).max(1024).required("Field is required"),
});

function Account() {
  const { data: session, status } = useSession();
  const { data: user } = trpc.user.get.useQuery(undefined, {
    enabled: !!session?.user,
  });
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated!");
    },
    onError: () => {
      toast.error("An Error occured!");
    },
  });
  const formik = useFormik<UpdateProfileFields>({
    initialValues: {
      fullName: user?.profile?.fullName ?? "",
      phone: user?.profile?.phone ?? "",
      institute: user?.profile?.institute ?? "",
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: (values) => {
      updateProfileMutation.mutate(values);
    },
  });

  return (
    <>
      <Head>
        <title>Account | Onushilonik</title>
      </Head>
      <Container sx={{ mt: 4 }}>
        {status === "loading" ? (
          <LinearProgress />
        ) : (
          <Box>
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Email: {user?.email}
            </Typography>
            {user?.profile && (
              <Typography variant="body1" color="text.secondary">
                Phone: {user?.profile.phone}
              </Typography>
            )}
            {user?.profile && (
              <Typography variant="body1" color="text.secondary">
                Institute: {user?.profile.institute}
              </Typography>
            )}
          </Box>
        )}
        <Typography variant="h5" sx={{ mt: 4 }} gutterBottom>
          Payments
        </Typography>
        <MuiTable
          rows={user?.profile?.payments ?? []}
          columns={[
            {
              id: "paymentId",
              label: "Payment Id",
            },
            {
              label: "Payment Method",
              id: "method",
              cell: ({ method }) => method.toLowerCase(),
            },
            {
              id: "transactionId",
              label: "Transaction Id",
            },

            {
              id: "createdAt",
              label: "Payment Time",
              cell: ({ createdAt }) => format(createdAt as Date, "dd/MM/yyyy"),
            },
            {
              id: "status",
              label: "Status",
              cell: ({ status }) => {
                return {
                  [PAYMENT_STATUS.PENDING]: (
                    <Chip size="small" label="pending" color="warning" />
                  ),
                  [PAYMENT_STATUS.FAILED]: (
                    <Chip size="small" label="failed" color="error" />
                  ),
                  [PAYMENT_STATUS.SUCCESS]: (
                    <Chip size="small" label="success" color="success" />
                  ),
                }[status as PAYMENT_STATUS];
              },
            },
          ]}
        ></MuiTable>
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }} gutterBottom>
          Update Profile
        </Typography>
        <Box
          component={"form"}
          onSubmit={formik.handleSubmit}
          sx={{ mb: 4, maxWidth: 600 }}
        >
          <TextField
            label="Full Name"
            name="fullName"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.fullName && !!formik.errors.fullName}
            helperText={formik.touched.fullName && formik.errors.fullName}
          />
          <TextField
            label="Phone Number"
            name="phone"
            value={formik.values.phone}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.phone && !!formik.errors.phone}
            helperText={formik.touched.phone && formik.errors.phone}
          />
          <TextField
            label="Your Institute"
            name="institute"
            value={formik.values.institute}
            onChange={formik.handleChange}
            fullWidth
            sx={{ mb: 2 }}
            error={formik.touched.institute && !!formik.errors.institute}
            helperText={formik.touched.institute && formik.errors.institute}
          />
          <Box sx={{ mt: 2 }}>
            <LoadingButton
              loading={updateProfileMutation.isLoading}
              type="submit"
              variant="contained"
            >
              Update Profile
            </LoadingButton>
          </Box>
        </Box>
      </Container>
    </>
  );
}

export default Account;
