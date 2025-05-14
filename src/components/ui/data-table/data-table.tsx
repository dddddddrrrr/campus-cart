"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Skeleton } from "~/components/ui/skeleton";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  PaginationState,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableFilterBox } from "./data-table-filter-box";

export interface FilterOption {
  label: string;
  value: string;
}

export type FilterValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | string[]
  | number[];

export interface Filter {
  column: string;
  label: string;
  type: "input" | "select" | "date-range" | "number-range";
  options?: FilterOption[];
  precision?: number;
}

export type FilterValues = Record<string, FilterValue>;

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalItems?: number;
  pageSizeOptions?: number[];
  filters?: Filter[];
  onSearch?: (values: FilterValues) => void;
  defaultValues?: FilterValues;
  filterLoading?: Record<string, boolean>;
  onFilterChange?: (column: string, value: FilterValue) => void;
  pagination?: {
    pageCount: number;
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  loading?: boolean;
  summaryData?: Record<string, string>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalItems,
  pageSizeOptions = [10, 20, 30, 40, 50],
  filters,
  onSearch,
  defaultValues,
  filterLoading,
  onFilterChange,
  pagination,
  loading,
  summaryData,
}: DataTableProps<TData, TValue>) {
  const [pageIndex, setPageIndex] = React.useState(
    pagination?.page ? pagination.page - 1 : 0,
  );
  const [pageSize, setPageSize] = React.useState(pagination?.pageSize ?? 10);

  // 更新分页状态
  React.useEffect(() => {
    console.log("DataTable useEffect - pagination changed:", 
      "external page:", pagination?.page, 
      "internal pageIndex:", pageIndex);
      
    if (pagination?.page) {
      setPageIndex(pagination.page - 1);
    }
    if (pagination?.pageSize) {
      setPageSize(pagination.pageSize);
    }
  }, [pagination?.page, pagination?.pageSize]);

  const paginationState = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const pageCount = React.useMemo(
    () => pagination?.pageCount ?? Math.ceil((totalItems ?? 0) / pageSize),
    [pagination?.pageCount, totalItems, pageSize],
  );

  const handlePaginationChange = React.useCallback(
    (
      updaterOrValue:
        | PaginationState
        | ((old: PaginationState) => PaginationState),
    ) => {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(paginationState)
          : updaterOrValue;

      console.log("DataTable - handlePaginationChange:", 
        "current:", { pageIndex, pageSize },
        "new:", newPagination);

      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);

      if (pagination?.onPageChange) {
        console.log("DataTable - calling onPageChange with:", newPagination.pageIndex + 1);
        pagination.onPageChange(newPagination.pageIndex + 1);
      }
      if (pagination?.onPageSizeChange && newPagination.pageSize !== pageSize) {
        console.log("DataTable - calling onPageSizeChange with:", newPagination.pageSize);
        pagination.onPageSizeChange(newPagination.pageSize);
      }
    },
    [paginationState, pagination, pageSize],
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    state: {
      pagination: paginationState,
    },
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  return (
    <div className="space-y-4">
      {filters && (
        <DataTableFilterBox
          table={table}
          filters={filters}
          onSearch={onSearch ?? (() => {
            // 默认空实现，不执行任何操作
          })}
          defaultValues={defaultValues}
          filterLoading={filterLoading}
          onFilterChange={onFilterChange}
        />
      )}
      <ScrollArea className="grid h-[calc(80vh-220px)] rounded-md border bg-white dark:bg-background md:h-[calc(90dvh-240px)]">
        <div className="min-w-max">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                // 加载状态
                <>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {columns.map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ) : data.length === 0 ? (
                // 空数据状态
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-[350px]">
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="relative">
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                          <span className="mt-2 text-muted-foreground">
                            暂无数据
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                // 数据展示
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const value = cell.getValue();
                      const content = flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      );

                      return (
                        <TableCell key={cell.id}>
                          {cell.column.id === "actions" ? (
                            content
                          ) : value === "" ||
                            value === null ||
                            value === undefined ? (
                            <div className="min-w-[160px]">-</div>
                          ) : (
                            content
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-between">
        <div>
          {loading ? (
            <div className="font-medium">
              <Skeleton className="h-6 w-40" />
            </div>
          ) : summaryData && Object.keys(summaryData).length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-2 text-sm font-medium">
              {Object.entries(summaryData).map(([key, value]) => (
                <div key={key}>
                  {key}: {value}
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <DataTablePagination
          table={table}
          pageCount={pageCount}
          currentPage={pagination?.page ?? pageIndex + 1}
          pageSize={pagination?.pageSize ?? pageSize}
          total={pagination?.total ?? totalItems ?? 0}
          onPageChange={(page) => {
            if (pagination?.onPageChange) {
              pagination.onPageChange(page);
            } else {
              setPageIndex(page - 1);
            }
          }}
          onPageSizeChange={
            pagination?.onPageSizeChange ?? ((size) => setPageSize(size))
          }
          loading={loading}
        />
      </div>
    </div>
  );
}
