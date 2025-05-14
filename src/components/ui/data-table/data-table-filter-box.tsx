"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Filter, FilterValue, FilterValues } from "./data-table";
import { Search, X } from "lucide-react";

interface DataTableFilterBoxProps<TData> {
  table: Table<TData>;
  filters: Filter[];
  onSearch: (values: FilterValues) => void;
  defaultValues?: FilterValues;
  filterLoading?: Record<string, boolean>;
  onFilterChange?: (column: string, value: FilterValue) => void;
}

export function DataTableFilterBox<TData>({
  table,
  filters,
  onSearch,
  defaultValues = {},
  filterLoading,
  onFilterChange,
}: DataTableFilterBoxProps<TData>) {
  const [filterValues, setFilterValues] =
    React.useState<FilterValues>(defaultValues);

  // 当默认值变化时更新筛选值
  React.useEffect(() => {
    console.log("FilterBox useEffect - defaultValues changed:", defaultValues);

    // 使用函数形式的setState，可以访问到最新的state值
    setFilterValues((currentValues) => {
      // 只有当默认值与当前筛选值不同时才更新
      if (JSON.stringify(defaultValues) !== JSON.stringify(currentValues)) {
        console.log("FilterBox useEffect - updating filterValues");
        return defaultValues;
      }
      return currentValues;
    });
  }, [defaultValues]); // 移除filterValues依赖

  // 处理筛选值变化
  const handleFilterChange = (column: string, value: FilterValue) => {
    setFilterValues((prev) => {
      const newValues = { ...prev, [column]: value };

      // 如果有外部筛选变化处理函数，则调用它
      if (onFilterChange) {
        onFilterChange(column, value);
      }

      return newValues;
    });
  };

  // 处理搜索按钮点击
  const handleSearch = () => {
    onSearch(filterValues);
  };

  // 处理重置按钮点击
  const handleReset = () => {
    const emptyValues: FilterValues = {};
    filters.forEach((filter) => {
      emptyValues[filter.column] = filter.type === "select" ? "all" : "";
    });

    setFilterValues(emptyValues);
    onSearch(emptyValues);
  };

  // 渲染筛选控件
  const renderFilterControl = (filter: Filter) => {
    const isLoading = filterLoading?.[filter.column] ?? false;

    switch (filter.type) {
      case "input":
        return (
          <Input
            placeholder={`请输入${filter.label}`}
            value={(filterValues[filter.column] as string) || ""}
            onChange={(e) => handleFilterChange(filter.column, e.target.value)}
            disabled={isLoading}
            className="h-9"
          />
        );

      case "select":
        return (
          <Select
            value={(filterValues[filter.column] as string) || ""}
            onValueChange={(value) => handleFilterChange(filter.column, value)}
            disabled={isLoading}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder={`请选择${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      // 可以根据需要添加更多筛选类型

      default:
        return null;
    }
  };

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filters.map((filter) => (
          <div key={filter.column} className="space-y-2">
            <Label htmlFor={filter.column}>{filter.label}</Label>
            {renderFilterControl(filter)}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="h-9"
        >
          <X className="mr-2 h-4 w-4" />
          重置
        </Button>
        <Button size="sm" onClick={handleSearch} className="h-9">
          <Search className="mr-2 h-4 w-4" />
          搜索
        </Button>
      </div>
    </div>
  );
}
