import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { trpc } from "@/utils/trpc";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { PAYMENT_STATUS, USER_ROLE } from "@prisma/client";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import MuiTable from "@/components/MuiTable";
import { format } from "date-fns";

const roleOptions = Object.values(USER_ROLE);

const User: NextPageWithLayout = () => {
  const router = useRouter();
  const [role, setRole] = React.useState<USER_ROLE | null>(null);
  const { data: session } = useSession();

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = trpc.admin.users.getOne.useQuery(router.query.userId as string, {
    enabled: !!router.query.userId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data) setRole(data.role);
    },
  });

  const updateRoleMutation = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Role updated successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const deleteUserMutation = trpc.admin.users.delete.useMutation({
    onSuccess: (data) => {
      router.push("/dashboard/users").then(() => {
        toast.success(`User ${data.email} deleted successfully`);
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const blockUserMutation = trpc.admin.users.block.useMutation({
    onSuccess: (data) => {
      refetch();
      toast.success(
        `User ${data.active ? "unblocked" : "blocked"} successfully`
      );
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleChange = (event: SelectChangeEvent) => {
    setRole(event.target.value as USER_ROLE);
  };

  return (
    <>
      <Head>
        <title>{user?.name ?? "user"} | Onushilonik Dashboard</title>
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
          <Link href="/dashboard/users" underline="hover" color="inherit">
            Users
          </Link>
          <Typography color="inherit">{user?.name ?? "user"}</Typography>
        </Breadcrumbs>

        {isLoading && <LinearProgress sx={{ mt: 1 }} />}
        {isError && (
          <Alert severity="error">
            <Typography variant="body1">{error?.message}</Typography>
          </Alert>
        )}
        <ListItem>
          <ListItemAvatar>
            <Avatar
              alt={user?.name ?? "user"}
              src={user?.image ? `${user.image}` : undefined}
            />
          </ListItemAvatar>
          <ListItemText
            primary={user?.name}
            secondary={user?.email}
            primaryTypographyProps={{ variant: "h4" }}
            secondaryTypographyProps={{ variant: "body1" }}
          />
        </ListItem>

        {user ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {user.profile ? (
                  <Card>
                    <CardContent>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary={"Full Name"}
                            secondary={user.profile.fullName}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={"Phone Number"}
                            secondary={user.profile.phone}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary={"Institute"}
                            secondary={user.profile.institute}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                ) : (
                  <Card sx={{ height: "100%" }}>
                    <CardContent>
                      <Typography variant="body1">
                        <i>User profile not added.</i>
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}
                    >
                      <Typography>User Actions</Typography>
                      <Box sx={{ display: "flex" }}>
                        <FormControl
                          variant="standard"
                          fullWidth
                          sx={{ width: "100%" }}
                        >
                          <InputLabel id="user-role-select">
                            User Role
                          </InputLabel>
                          <Select
                            label="User Role"
                            id="user-role-select"
                            value={role ?? ""}
                            readOnly={session?.user?.id === user?.id}
                            onChange={handleChange}
                          >
                            {roleOptions.map((role) => (
                              <MenuItem key={role} value={role}>
                                {role.split("_").join(" ")}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <LoadingButton
                          variant="outlined"
                          sx={{ width: 200 }}
                          loading={updateRoleMutation.isLoading}
                          disabled={
                            session?.user?.role !== USER_ROLE.SUPER_ADMIN ||
                            session?.user?.id === user?.id ||
                            !role
                          }
                          onClick={() => {
                            if (!role || role === user.role) return;
                            updateRoleMutation.mutate({
                              id: user.id,
                              role: role,
                            });
                          }}
                        >
                          Update role
                        </LoadingButton>
                      </Box>
                      <Box sx={{ display: "flex" }} gap={4}>
                        <LoadingButton
                          color={user.active ? "error" : "success"}
                          variant={user.active ? "outlined" : "contained"}
                          loading={blockUserMutation.isLoading}
                          disabled={session?.user?.id === user?.id}
                          size="large"
                          onClick={() => {
                            blockUserMutation.mutate({
                              id: user.id,
                              active: !user.active,
                            });
                          }}
                        >
                          {user.active ? "Block User" : "Unblock User"}
                        </LoadingButton>

                        <LoadingButton
                          color="error"
                          variant={"contained"}
                          loading={deleteUserMutation.isLoading}
                          disabled={session?.user?.id === user?.id}
                          size="large"
                          onClick={() => {
                            deleteUserMutation.mutate(user.id);
                          }}
                        >
                          {"Delete User"}
                        </LoadingButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
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
                  cell: ({ createdAt }) =>
                    format(createdAt as Date, "dd/MM/yyyy HH:mm a"),
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
                {
                  id: "action",
                  label: "Action",
                  cell: ({ id }) => (
                    <Button
                      LinkComponent={NextLink}
                      href={`/dashboard/payments/${id}`}
                      size={"small"}
                      disableElevation
                    >
                      view
                    </Button>
                  ),
                },
              ]}
            ></MuiTable>
          </>
        ) : (
          ""
        )}
      </Container>
    </>
  );
};

User.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default User;
