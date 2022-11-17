import React from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import LinearProgress from "@mui/material/LinearProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { trpc } from "@/utils/trpc";
import Link from "@/components/Link";
import DashboardLayout from "@/layouts/DashboardLayout";
import { NextPageWithLayout } from "@/pages/_app";
import { USER_ROLE } from "@prisma/client";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { env } from "@/env/client.mjs";

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
  } = trpc.useQuery(["admin.users.getOne", router.query.userId as string], {
    enabled: !!router.query.userId,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      if (data) setRole(data.role);
    },
  });

  const updateRoleMutation = trpc.useMutation("admin.users.updateRole", {
    onSuccess: () => {
      toast.success("Role updated successfully");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const deleteUserMutation = trpc.useMutation("admin.users.delete", {
    onSuccess: (data) => {
      router.push("/dashboard/users").then(() => {
        toast.success(`User ${data.email} deleted successfully`);
      });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const blockUserMutation = trpc.useMutation("admin.users.block", {
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
          <NextLink href="/" passHref>
            <IconButton component="a">
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
              src={
                user?.image
                  ? `${user.image}?key=${env.NEXT_PUBLIC_GOOGLE_API_KEY}`
                  : undefined
              }
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
          <Paper sx={{ p: 2, maxWidth: 500 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <Typography>User Actions</Typography>
              <Box sx={{ display: "flex" }}>
                <FormControl
                  variant="standard"
                  fullWidth
                  sx={{ width: "100%" }}
                >
                  <InputLabel id="user-role-select">User Role</InputLabel>
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
                    updateRoleMutation.mutate({ id: user.id, role: role });
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
          </Paper>
        ) : (
          ""
        )}
      </Container>
    </>
  );
};

User.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default User;
