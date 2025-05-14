"use client";

import * as React from "react";
import { useState, useMemo, } from "react";
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
import { Edit, Plus, Trash2,  } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


// 分类类型定义
type Category = {
  id: number;
  name: string;
  icon: string | null;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
};

// 分类表单验证Schema
const categoryFormSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  icon: z.string().optional().nullable(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryManagementPage() {
  // 状态管理
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState<string | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  // 分类表单
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      icon: "",
    },
  });

  // 获取分类列表数据
  const { data, isLoading, refetch } =
    api.category.adminFetchCategories.useQuery({
      page,
      pageSize,
      name,
    });

  // 删除分类的mutation
  const { mutateAsync: deleteCategoryMutation, isPending: isDeleting } =
    api.category.deleteCategory.useMutation({
      onSuccess: () => {
        toast.success("分类删除成功");
        setIsDeleteDialogOpen(false);
        void refetch();
      },
      onError: (error) => {
        toast.error(`删除失败: ${error.message}`);
      },
    });

  // 创建分类的mutation
  const { mutateAsync: createCategoryMutation, isPending: isCreating } =
    api.category.createCategory.useMutation({
      onSuccess: () => {
        toast.success("分类创建成功");
        setIsCreateDialogOpen(false);
        void refetch();
        form.reset();
      },
      onError: (error) => {
        toast.error(`创建失败: ${error.message}`);
      },
    });

  // 更新分类的mutation
  const { mutateAsync: updateCategoryMutation, isPending: isUpdating } =
    api.category.updateCategory.useMutation({
      onSuccess: () => {
        toast.success("分类更新成功");
        setIsEditDialogOpen(false);
        void refetch();
      },
      onError: (error) => {
        toast.error(`更新失败: ${error.message}`);
      },
    });

  // 处理搜索
  const handleSearch = (values: FilterValues) => {
    setName(values.name as string);
    setPage(1); // 重置到第一页
  };

  // 处理分类删除
  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    await deleteCategoryMutation(selectedCategory.id);
  };

  // 打开删除确认对话框
  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // 打开创建分类对话框
  const openCreateDialog = () => {
    form.reset({
      name: "",
      icon: "",
    });
    setIsCreateDialogOpen(true);
  };

  // 打开编辑分类对话框
  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    form.reset({
      name: category.name,
      icon: category.icon ?? "",
    });
    setIsEditDialogOpen(true);
  };

  // 处理创建分类
  const handleCreateCategory = async (values: CategoryFormValues) => {
    await createCategoryMutation({
      name: values.name,
      icon: values.icon ?? undefined,
    });
  };

  // 处理更新分类
  const handleUpdateCategory = async (values: CategoryFormValues) => {
    if (!selectedCategory) return;

    await updateCategoryMutation({
      id: selectedCategory.id,
      data: {
        name: values.name,
        icon: values.icon ?? undefined,
      },
    });
  };

  // 使用useMemo缓存分页配置对象
  const paginationConfig = useMemo(
    () => ({
      page,
      pageSize,
      pageCount: data?.meta.totalPages ?? 0,
      total: data?.meta.totalCategories ?? 0,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    }),
    [page, pageSize, data?.meta.totalPages, data?.meta.totalCategories],
  );

  // 使用useMemo缓存默认筛选值
  const defaultFilterValues = useMemo(
    () => ({
      name: name ?? "",
    }),
    [name],
  );

  // 图标选择器相关状态
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  // 常用图标列表
  const commonIcons = [
    { name: "BookOpen", label: "书籍" },
    { name: "Laptop", label: "电子产品" },
    { name: "Shirt", label: "衣物" },
    { name: "Dumbbell", label: "运动" },
    { name: "Home", label: "家居" },
    { name: "GraduationCap", label: "教育" },
    { name: "Music", label: "音乐" },
    { name: "ShoppingBag", label: "购物" },
    { name: "UtensilsCrossed", label: "餐饮" },
    { name: "Car", label: "交通" },
    { name: "Gamepad2", label: "游戏" },
    { name: "Palette", label: "艺术" },
  ];

  // 表格列定义
  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "分类名称",
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    },
    {
      accessorKey: "icon",
      header: "图标",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.icon ?? "无图标"}</div>
      ),
    },
    {
      accessorKey: "productCount",
      header: "商品数量",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.productCount}</div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.original.updatedAt), {
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
            onClick={() => openEditDialog(row.original)}
          >
            <Edit className="mr-2 h-4 w-4" />
            编辑
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => openDeleteDialog(row.original)}
            disabled={row.original.productCount > 0}
            title={
              row.original.productCount > 0 ? "该分类下有商品，无法删除" : ""
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  // 筛选条件定义
  const filters: Filter[] = [
    {
      column: "name",
      label: "分类名称",
      type: "input",
    },
  ];

  // 渲染分类表单
  const renderCategoryForm = (
    onSubmit: (values: CategoryFormValues) => Promise<void>,
    isSubmitting: boolean,
    submitButtonText: string,
  ) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类名称</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>图标</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="输入图标名称"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsIconPickerOpen(true)}
                    >
                      选择图标
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
            }}
          >
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "处理中..." : submitButtonText}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );

  // 图标选择器对话框
  const IconPickerDialog = () => (
    <Dialog open={isIconPickerOpen} onOpenChange={setIsIconPickerOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>选择图标</DialogTitle>
          <DialogDescription>选择一个图标用于分类显示</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-4">
          {commonIcons.map((icon) => (
            <Button
              key={icon.name}
              variant="outline"
              className="flex flex-col items-center gap-2 p-4"
              onClick={() => {
                form.setValue("icon", icon.name);
                setIsIconPickerOpen(false);
              }}
            >
              <div>{icon.name}</div>
              <div className="text-xs text-muted-foreground">{icon.label}</div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">分类管理</h1>
          <p className="text-muted-foreground">管理商品分类信息</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加分类
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.categories ?? []}
        loading={isLoading}
        totalItems={data?.meta.totalCategories}
        filters={filters}
        onSearch={handleSearch}
        defaultValues={defaultFilterValues}
        pagination={paginationConfig}
      />

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除分类 &quot;{selectedCategory?.name}&quot;
              吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteCategory}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建分类对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加分类</DialogTitle>
            <DialogDescription>填写以下信息创建新分类。</DialogDescription>
          </DialogHeader>

          {renderCategoryForm(handleCreateCategory, isCreating, "创建分类")}
        </DialogContent>
      </Dialog>

      {/* 编辑分类对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑分类</DialogTitle>
            <DialogDescription>修改分类信息。</DialogDescription>
          </DialogHeader>

          {renderCategoryForm(handleUpdateCategory, isUpdating, "更新分类")}
        </DialogContent>
      </Dialog>

      {/* 图标选择器对话框 */}
      <IconPickerDialog />
    </div>
  );
}
