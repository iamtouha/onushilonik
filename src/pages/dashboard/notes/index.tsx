import { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import MaterialReactTable, { type MRT_ColumnDef } from "material-react-table";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import IconButton from "@mui/material/IconButton";
import HomeIcon from "@mui/icons-material/Home";
import type { NextPageWithLayout } from "@/pages/_app";
import DashboardLayout from "@/layouts/DashboardLayout";
import Link from "@/components/Link";
import { trpc } from "@/utils/trpc";
import { format } from "date-fns";

type ColumnFilter = { id: string; value: unknown };
type ColumnSort = { id: string; desc: boolean };
type NoteWithChapter = {
  id: string;
  title: string;
  code: string;
  published: boolean;
  createdAt: Date;
  chapter: {
    id: string;
    title: string;
    subject: { id: string; title: string };
  };
};

const Notes: NextPageWithLayout = () => {
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

  const { data, isError, isLoading, isFetching } =
    trpc.admin.notes.get.useQuery(
      {
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sortBy: sorting[0]?.id as "createdAt" | "code" | "title" | "published",
        sortDesc: sorting[0]?.desc,
        title: columnFilters.find((f) => f.id === "title")?.value as string,
        code: columnFilters.find((f) => f.id === "code")?.value as string,
        subjectTitle: columnFilters.find((f) => f.id === "chapter.title")
          ?.value as string,
        chapterTitle: columnFilters.find(
          (f) => f.id === "chapter.subject.title"
        )?.value as string,
      },

      { enabled, refetchOnWindowFocus: false }
    );

  const columns = useMemo<MRT_ColumnDef<NoteWithChapter>[]>(() => {
    return [
      {
        accessorKey: "id",
        header: "ID",
        enableColumnFilter: false,
        enableSorting: false,
      },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "title", header: "Note Title" },
      {
        accessorKey: "chapter.title",
        header: "Chapter",
        enableSorting: false,
      },
      {
        accessorKey: "chapter.subject.title",
        header: "Subject",
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
    router.push(`/dashboard/notes/${id}`);
  };

  return (
    <>
      <Head>
        <title>Notes | Onushilonik Dashboard</title>
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
          <Typography color="inherit">Notes</Typography>
        </Breadcrumbs>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography gutterBottom variant="h4" sx={{ mb: 2 }}>
            Notes
          </Typography>
          <Box sx={{ ml: "auto", mr: 0 }} />
          <NextLink href={"/dashboard/notes/add"} passHref>
            <Button variant="contained" color="primary" component="a">
              Add New Note
            </Button>
          </NextLink>
        </Box>
        <MaterialReactTable
          columns={columns}
          data={data?.notes ?? []}
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
            onClick: () => navigateToSubject(row.original.id),
          })}
        />
      </Container>
    </>
  );
};

Notes.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Notes;
