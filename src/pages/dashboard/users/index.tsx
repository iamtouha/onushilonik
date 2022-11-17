import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import type { ColumnFilter, ColumnSort } from "@tanstack/react-table";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import Container from "@mui/material/Container";
import DashboardLayout from "@/layouts/DashboardLayout";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import type { NextPageWithLayout } from "@/pages/_app";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { User, USER_ROLE } from "@prisma/client";
import { format } from "date-fns";

type fieldValue = string | undefined;

const Users: NextPageWithLayout = () => {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [sorting, setSorting] = useState<ColumnSort[]>([
    { id: "createdAt", desc: true },
  ]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data, isError, isLoading, isFetching } = trpc.useQuery(
    [
      "admin.users.getAll",
      {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sortBy: sorting[0]?.id as any,
        sortDesc: sorting[0]?.desc,
        name: columnFilters.find((f) => f.id === "name")?.value as fieldValue,
        email: columnFilters.find((f) => f.id === "email")?.value as fieldValue,
        role: columnFilters.find((f) => f.id === "role")?.value as USER_ROLE,
      },
    ],
    { enabled, refetchOnWindowFocus: false }
  );

  useEffect(() => {
    setEnabled(true);
  }, []);

  const navigateToUser = (id: string) => {
    router.push(`/dashboard/users/${id}`);
  };
  const columns = useMemo<MRT_ColumnDef<User>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        enableSorting: false,
      },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "role",
        header: "Role",
        filterSelectOptions: [
          USER_ROLE.ADMIN,
          USER_ROLE.SUPER_ADMIN,
          USER_ROLE.USER,
        ],
        Cell: ({ cell }) =>
          (cell.getValue() as USER_ROLE).split("_").join(" ").toLowerCase(),
        filterVariant: "select",
      },
      {
        accessorKey: "active",
        header: "Active",
        enableColumnFilter: false,
        Cell: ({ cell }) => {
          return cell.getValue() ? (
            <Typography>Yes</Typography>
          ) : (
            <Typography color="error">No</Typography>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Joined on",
        Cell: ({ cell }) =>
          format(cell.getValue() as Date, "dd/MM/yyyy hh:mm a"),
        enableColumnFilter: false,
      },
    ];
  }, []);

  return (
    <>
      <Head>
        <title>Users | Onushilonik Dashboard</title>
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

          <Typography color="inherit">Users</Typography>
        </Breadcrumbs>
        <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
          Users
        </Typography>
        <MaterialReactTable
          columns={columns}
          data={data?.users ?? []}
          enableGlobalFilter={false}
          manualFiltering
          manualPagination
          manualSorting
          rowCount={data?.count ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          initialState={{
            columnVisibility: { id: false },
            density: "compact",
          }}
          state={{
            sorting,
            columnFilters,
            pagination,
            isLoading,
            showAlertBanner: isError,
            showProgressBars: isFetching,
          }}
          muiToolbarAlertBannerProps={
            isError
              ? {
                  color: "error",
                  children: "Error loading data",
                }
              : undefined
          }
          muiTableBodyCellProps={{ sx: { cursor: "pointer" } }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => navigateToUser(row.original.id),
          })}
        />
      </Container>
    </>
  );
};

Users.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Users;
