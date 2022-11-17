import { useMemo, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import { format } from "date-fns";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { Payment, PAYMENT_METHOD, PAYMENT_STATUS } from "@prisma/client";
import { trpc } from "@/utils/trpc";
import { NextPageWithLayout } from "@/pages/_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "@/components/Link";

type ColumnFilter = { id: string; value: unknown };
type ColumnSort = { id: string; desc: boolean };
type SortBy = "createdAt" | "paymentId" | "transactionId" | "status" | "method";
type PaymentWithSub = Payment & {
  subscription: {
    user: {
      email: string | null;
      id: string;
    };
  };
};

const Payments: NextPageWithLayout = () => {
  const router = useRouter();
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
      "admin.payments.getAll",
      {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        sortBy: sorting[0]?.id as SortBy,
        sortDesc: sorting[0]?.desc,
        method: columnFilters.find((f) => f.id === "method")
          ?.value as PAYMENT_METHOD,
        status: columnFilters.find((f) => f.id === "status")
          ?.value as PAYMENT_STATUS,
      },
    ],
    { refetchOnWindowFocus: false }
  );

  const columns = useMemo<MRT_ColumnDef<PaymentWithSub>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "subscription.user.email",
        header: "User Email",
        enableSorting: false,
      },
      {
        accessorKey: "method",
        header: "Method",
        filterVariant: "select",
        filterSelectOptions: Object.values(PAYMENT_METHOD),
      },
      { accessorKey: "paymentId", header: "Payment Id" },
      { accessorKey: "transactionId", header: "Transaction Id" },
      {
        accessorKey: "status",
        header: "Status",
        filterVariant: "select",
        filterSelectOptions: Object.values(PAYMENT_STATUS),
      },
      {
        accessorKey: "createdAt",
        header: "Added at",
        Cell: ({ cell }) =>
          format(cell.getValue() as Date, "dd/MM/yyyy hh:mm a"),
        enableColumnFilter: false,
      },
    ];
  }, []);

  const navigateToSubject = (id: string) => {
    router.push(`/dashboard/payments/${id}`);
  };

  return (
    <>
      <Head>
        <title>Payments | Onushilonik Dashboard</title>
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

          <Typography color="inherit">Payments</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Payments
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
        </Box>
        <MaterialReactTable
          columns={columns}
          data={data?.payments ?? []}
          enableGlobalFilter={false}
          manualFiltering
          manualPagination
          manualSorting
          rowCount={data?.count ?? 0}
          onColumnFiltersChange={setColumnFilters}
          onPaginationChange={setPagination}
          onSortingChange={setSorting}
          initialState={{
            density: "compact",
            columnVisibility: { id: false },
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
            onClick: () => navigateToSubject(row.original.id),
          })}
        />
      </Container>
    </>
  );
};

Payments.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Payments;
