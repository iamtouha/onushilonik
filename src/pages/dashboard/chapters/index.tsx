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
import { Chapter } from "@prisma/client";
import { format } from "date-fns";

type ColumnFilter = { id: string; value: unknown };
type ColumnSort = { id: string; desc: boolean };
type ChaptertWithCount = Chapter & {
  _count: { questions: number };
  subject: { id: string; title: string };
};

const Chapters: NextPageWithLayout = () => {
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
      "admin.chapters.get",
      {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id as "createdAt" | "title" | "code" | "published",
        sortDesc: sorting[0]?.desc,
        title: columnFilters.find((f) => f.id === "title")?.value as string,
        code: columnFilters.find((f) => f.id === "code")?.value as string,
        subjectTitle: columnFilters.find((f) => f.id === "subject.title")
          ?.value as string,
      },
    ],
    { enabled, refetchOnWindowFocus: false }
  );

  const columns = useMemo<MRT_ColumnDef<ChaptertWithCount>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        enableSorting: false,
      },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "title", header: "Title" },
      {
        accessorKey: "subject.title",
        header: "Subject",
        enableSorting: false,
      },
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

  const navigateToSubject = (id: string) => {
    router.push(`/dashboard/chapters/${id}`);
  };

  return (
    <>
      <Head>
        <title>Chapters | Onushilonik Dashboard</title>
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
          <Typography color="inherit">Chapters</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Chapters
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
          <NextLink href={"/dashboard/chapters/add"} passHref>
            <Button variant="contained" color="primary" component="a">
              Add Chapter
            </Button>
          </NextLink>
        </Box>
        <MaterialReactTable
          columns={columns}
          data={data?.chapters ?? []}
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
            onClick: () => navigateToSubject(row.original.id),
          })}
        />
      </Container>
    </>
  );
};

Chapters.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Chapters;
