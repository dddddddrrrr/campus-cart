"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Skeleton } from "~/components/ui/skeleton";

interface DataTablePaginationProps<TData> {
  table?: Table<TData>;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageCount,
  currentPage,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  loading = false,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  // 计算页码范围
  const getPageRange = () => {
    const range: number[] = [];
    const maxVisiblePages = 5;

    if (pageCount <= maxVisiblePages) {
      // 如果总页数小于等于最大可见页数，显示所有页码
      for (let i = 1; i <= pageCount; i++) {
        range.push(i);
      }
    } else {
      // 否则，显示当前页附近的页码
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(pageCount, start + maxVisiblePages - 1);

      // 调整起始页，确保显示 maxVisiblePages 个页码
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) {
        range.push(i);
      }
    }

    return range;
  };

  const pageRange = getPageRange();

  // 处理页码变化
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount || page === currentPage || loading) return;
    onPageChange(page);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (value: string) => {
    if (loading) return;
    const newPageSize = parseInt(value, 10);
    onPageSizeChange?.(newPageSize);
  };

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      {loading ? (
        <Skeleton className="h-8 w-[250px]" />
      ) : (
        <>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">每页行数</p>
              <Select
                value={String(pageSize)}
                onValueChange={handlePageSizeChange}
                disabled={loading}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-[100px] items-center justify-center text-sm font-medium">
              第 {currentPage} 页，共 {pageCount} 页
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || loading}
              >
                <span className="sr-only">首页</span>
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <span className="sr-only">上一页</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* 页码按钮 */}
              <div className="hidden sm:flex">
                {pageRange.map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                  >
                    <span>{page}</span>
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pageCount || loading}
              >
                <span className="sr-only">下一页</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => handlePageChange(pageCount)}
                disabled={currentPage === pageCount || loading}
              >
                <span className="sr-only">尾页</span>
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">共 {total} 条记录</div>
        </>
      )}
    </div>
  );
}
