import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import MaterialReactTable, { MRT_ColumnDef } from "material-react-table";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import { NextPageWithLayout } from "@/pages/_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { QuestionSet, SET_TYPE } from "@prisma/client";
import { format } from "date-fns";

type ColumnFilter = { id: string; value: unknown };
type ColumnSort = { id: string; desc: boolean };
type QuestionSetWithCount = QuestionSet & { _count: { questions: number } };
type SortType = "createdAt" | "code" | "title" | "type" | "published" | "trial";

const QuestionSets: NextPageWithLayout = () => {
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
      "admin.sets.get",
      {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id as SortType,
        sortDesc: sorting[0]?.desc,
        type: columnFilters.find((f) => f.id === "type")?.value as SET_TYPE,
        title: columnFilters.find((f) => f.id === "title")?.value as string,
        code: columnFilters.find((f) => f.id === "code")?.value as string,
      },
    ],
    { enabled, refetchOnWindowFocus: false }
  );

  const columns = useMemo<MRT_ColumnDef<QuestionSetWithCount>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        enableSorting: false,
      },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "type",
        header: "Type",
        filterVariant: "select",
        filterSelectOptions: Object.values(SET_TYPE),
        Cell: ({ cell }) =>
          cell.getValue<SET_TYPE>().split("_").join(" ").toLowerCase(),
      },
      { accessorKey: "title", header: "Title" },

      {
        accessorKey: "_count.questions",
        header: "Total Questions",
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        accessorKey: "published",
        header: "Publish status",
        Cell: ({ cell }) => (cell.getValue() ? "Published" : "Not published"),
        enableColumnFilter: false,
      },
      {
        accessorKey: "trial",
        header: "Free Trial",
        Cell: ({ cell }) => (cell.getValue() ? "Yes" : ""),
        enableColumnFilter: false,
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

  useEffect(() => {
    setEnabled(true);
  }, []);

  const navigateToQuestionSet = (id: string) => {
    router.push(`/dashboard/question-sets/${id}`);
  };

  return (
    <>
      <Head>
        <title>Question Sets | Onushilonik Dashboard</title>
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

          <Typography color="inherit">Question Sets</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Question Sets
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
          <NextLink href={"/dashboard/question-sets/create"} passHref>
            <Button variant="contained" color="primary" component="a">
              New Question Set
            </Button>
          </NextLink>
        </Box>
        <MaterialReactTable
          columns={columns}
          data={data?.questionSets ?? []}
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
            onClick: () => navigateToQuestionSet(row.original.id),
          })}
        />
      </Container>
    </>
  );
};

QuestionSets.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default QuestionSets;
