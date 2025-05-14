"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { DataTable } from "~/components/ui/data-table/data-table";
import { api } from "~/trpc/react";
import { ColumnDef } from "@tanstack/react-table";
import { Filter, FilterValues } from "~/components/ui/data-table/data-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Edit } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";

// 用户类型定义
type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  credit: number;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Zod schema for credit form
const creditFormSchema = z.object({
  amount: z.number().min(0, "金额必须大于或等于0"),
});

type CreditFormValues = z.infer<typeof creditFormSchema>;

export default function UserManagementPage() {
  // 状态管理
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [isUpdateCreditDialogOpen, setIsUpdateCreditDialogOpen] =
    useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  console.log(email, "email");

  // 使用表单处理
  const form = useForm<CreditFormValues>({
    resolver: zodResolver(creditFormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  // 获取用户列表数据
  console.log("UserPage render - page:", page, "pageSize:", pageSize);

  const { data, isLoading, refetch } = api.user.fetchAllUsers.useQuery({
    page,
    pageSize,
    email,
  });

  console.log(
    "UserPage - data received:",
    data
      ? {
          users: data.users.length,
          meta: data.meta,
        }
      : "loading",
  );

  // 使用useMemo缓存分页配置对象
  const paginationConfig = useMemo(
    () => ({
      page,
      pageSize,
      pageCount: data?.meta.totalPages ?? 0,
      total: data?.meta.totalUsers ?? 0,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    }),
    [page, pageSize, data?.meta.totalPages, data?.meta.totalUsers],
  );

  // 使用useMemo缓存默认筛选值
  const defaultFilterValues = useMemo(
    () => ({
      email: email ?? "",
    }),
    [email],
  );

  // 更新用户余额的mutation
  const { mutateAsync: updateCreditMutation, isPending } =
    api.user.updateUserCredit.useMutation({
      onSuccess: () => {
        toast.success("用户余额更新成功");
        setIsUpdateCreditDialogOpen(false);
        void refetch();
      },
      onError: (error) => {
        toast.error(`更新失败: ${error.message}`);
      },
    });

  // 处理搜索
  const handleSearch = (values: FilterValues) => {
    setEmail(values.email as string);
    setPage(1); // 重置到第一页
  };

  // 处理余额更新
  const handleUpdateCredit = async (values: CreditFormValues) => {
    if (!selectedUser) return;

    await updateCreditMutation({
      userId: selectedUser.id,
      amount: values.amount,
    });
  };

  // 打开余额更新对话框
  const openUpdateCreditDialog = (user: User) => {
    setSelectedUser(user);

    form.reset({ amount: 0 });
    setIsUpdateCreditDialogOpen(true);
  };

  // 表格列定义
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "姓名",
      cell: ({ row }) => <div>{row.original.name ?? "-"}</div>,
    },
    {
      accessorKey: "email",
      header: "邮箱",
      cell: ({ row }) => <div>{row.original.email ?? "-"}</div>,
    },
    {
      accessorKey: "role",
      header: "角色",
      cell: ({ row }) => (
        <div>
          {row.original.role === "ADMIN" ? (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
              管理员
            </span>
          ) : (
            <span className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
              普通用户
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "credit",
      header: "余额",
      cell: ({ row }) => (
        <div className="font-medium">¥{row.original.credit.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "注册时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.createdAt), {
            addSuffix: true,
            locale: zhCN,
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "操作",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openUpdateCreditDialog(row.original)}
          >
            <Edit className="mr-2 h-4 w-4" />
            余额管理
          </Button>
        </div>
      ),
    },
  ];

  // 筛选条件定义
  const filters: Filter[] = [
    {
      column: "email",
      label: "邮箱",
      type: "input",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">用户管理</h1>
          <p className="text-muted-foreground">管理系统用户和余额</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.users ?? []}
        loading={isLoading}
        totalItems={data?.meta.totalUsers}
        filters={filters}
        onSearch={handleSearch}
        defaultValues={defaultFilterValues}
        pagination={paginationConfig}
      />

      {/* 余额更新对话框 */}
      <Dialog
        open={isUpdateCreditDialogOpen}
        onOpenChange={setIsUpdateCreditDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>用户余额管理</DialogTitle>
            <DialogDescription>
              {selectedUser?.name ?? selectedUser?.email} 当前余额: ¥
              {selectedUser?.credit.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateCredit)}>
              <div className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="grid grid-cols-4 items-center gap-4">
                      <FormLabel className="text-right">金额</FormLabel>
                      <div className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateCreditDialogOpen(false)}
                  type="button"
                >
                  取消
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "处理中..." : "确认更新"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
