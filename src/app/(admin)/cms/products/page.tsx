"use client";

import * as React from "react";
import { useState, useMemo, useEffect } from "react";
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
import { Label } from "~/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Edit, Plus, Trash2, Upload, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
// 商品类型定义
type Product = {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
  imageUrl: string | null;
  discount: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// 商品表单验证Schema
const productFormSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "价格不能为负数"),
  stock: z.coerce.number().int().min(0, "库存不能为负数"),
  categoryId: z.coerce.number().int().min(0, "请选择有效的分类"),
  imageUrl: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(true),
  discount: z.coerce.number().min(0).max(100).default(0),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function ProductManagementPage() {
  // 状态管理
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [name, setName] = useState<string | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 商品表单
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: 0,
      imageUrl: "",
      isFeatured: false,
      isNew: true,
      discount: 0,
    },
  });

  // 获取商品列表数据
  const { data, isLoading, refetch } = api.product.adminFetchProducts.useQuery({
    page,
    pageSize,
    name,
    categoryId,
    minPrice,
    maxPrice,
  });

  // 获取分类列表用于过滤
  const { data: categoriesData } = api.category.fetchCategories.useQuery();

  // 转换分类数据为下拉选项格式
  const categories = useMemo(() => {
    return (
      categoriesData?.map((category) => ({
        id: category.id,
        name: category.name,
      })) ?? []
    );
  }, [categoriesData]);
  console.log(categories);

  // 删除商品的mutation
  const { mutateAsync: deleteProductMutation, isPending: isDeleting } =
    api.product.deleteProduct.useMutation({
      onSuccess: () => {
        toast.success("商品删除成功");
        setIsDeleteDialogOpen(false);
        void refetch();
      },
      onError: (error) => {
        toast.error(`删除失败: ${error.message}`);
      },
    });

  // 创建商品的mutation
  const { mutateAsync: createProductMutation, isPending: isCreating } =
    api.product.createProduct.useMutation({
      onSuccess: () => {
        toast.success("商品创建成功");
        setIsCreateDialogOpen(false);
        void refetch();
        form.reset();
      },
      onError: (error) => {
        toast.error(`创建失败: ${error.message}`);
      },
    });

  // 更新商品的mutation
  const { mutateAsync: updateProductMutation, isPending: isUpdating } =
    api.product.updateProduct.useMutation({
      onSuccess: () => {
        toast.success("商品更新成功");
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
    setCategoryId(
      values.categoryId && values.categoryId !== "all"
        ? Number(values.categoryId)
        : undefined,
    );
    setMinPrice(
      values.minPrice && values.minPrice !== ""
        ? Number(values.minPrice)
        : undefined,
    );
    setMaxPrice(
      values.maxPrice && values.maxPrice !== ""
        ? Number(values.maxPrice)
        : undefined,
    );
    setPage(1); // 重置到第一页
  };

  // 处理商品删除
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    await deleteProductMutation(selectedProduct.id);
  };

  // 打开删除确认对话框
  const openDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // 打开创建商品对话框
  const openCreateDialog = () => {
    form.reset({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      categoryId: 0,
      imageUrl: "",
      isFeatured: false,
      isNew: true,
      discount: 0,
    });
    setIsCreateDialogOpen(true);
  };

  // 打开编辑商品对话框
  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    form.reset({
      name: product.name,
      description: product.description ?? "",
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl ?? "",
      isFeatured: product.isFeatured,
      isNew: product.isNew,
      discount: product.discount,
    });
    setIsEditDialogOpen(true);
  };

  // 处理创建商品
  const handleCreateProduct = async (values: ProductFormValues) => {
    // 构建与API格式匹配的创建数据
    const createData = {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      categoryId: values.categoryId, // 直接使用categoryId
      imageUrl: values.imageUrl ?? undefined, // 使用imageUrl而不是image
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      discount: values.discount,
    };

    await createProductMutation(createData);
  };

  // 处理更新商品
  const handleUpdateProduct = async (values: ProductFormValues) => {
    if (!selectedProduct) return;

    // 构建与API格式匹配的更新数据
    const updateData = {
      name: values.name,
      description: values.description,
      price: values.price,
      stock: values.stock,
      categoryId: values.categoryId, // 直接使用categoryId
      imageUrl: values.imageUrl ?? undefined, // 使用imageUrl而不是image
      isFeatured: values.isFeatured,
      isNew: values.isNew,
      discount: values.discount,
    };

    await updateProductMutation({
      id: selectedProduct.id,
      data: updateData,
    });
  };

  // 使用useMemo缓存分页配置对象
  const paginationConfig = useMemo(
    () => ({
      page,
      pageSize,
      pageCount: data?.meta.totalPages ?? 0,
      total: data?.meta.totalProducts ?? 0,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    }),
    [page, pageSize, data?.meta.totalPages, data?.meta.totalProducts],
  );

  // 使用useMemo缓存默认筛选值
  const defaultFilterValues = useMemo(
    () => ({
      name: name ?? "",
      categoryId: categoryId ? String(categoryId) : "all",
      minPrice: minPrice ? String(minPrice) : "",
      maxPrice: maxPrice ? String(maxPrice) : "",
    }),
    [name, categoryId, minPrice, maxPrice],
  );

  // 修复Image组件的警告
  const imageWidth = 40;
  const imageHeight = 40;

  // 图片上传状态
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // 创建本地预览
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);

      // 在真实场景中，这里会调用上传API
      // 示例代码中我们使用本地预览URL模拟上传成功
      setTimeout(() => {
        form.setValue("imageUrl", reader.result as string);
        setIsUploading(false);
        toast.success("图片上传成功");
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  // 清除已上传图片
  const clearUploadedImage = () => {
    form.setValue("imageUrl", null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 当选中商品更改时，更新预览图片
  useEffect(() => {
    if (isEditDialogOpen && selectedProduct?.imageUrl) {
      setPreviewUrl(selectedProduct.imageUrl);
    } else if (isCreateDialogOpen) {
      setPreviewUrl(null);
    }
  }, [isEditDialogOpen, isCreateDialogOpen, selectedProduct]);

  // 表格列定义
  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "name",
      header: "商品名称",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: "imageUrl",
      header: "图片",
      cell: ({ row }) => (
        <div className="h-10 w-10 overflow-hidden rounded-md border">
          {row.original.imageUrl ? (
            <Image
              src={row.original.imageUrl}
              alt={row.original.name}
              width={imageWidth}
              height={imageHeight}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-xs text-gray-500">
              无图片
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "price",
      header: "价格",
      cell: ({ row }) => (
        <div className="font-medium">¥{row.original.price.toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "stock",
      header: "库存",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.stock > 0 ? (
            row.original.stock
          ) : (
            <span className="text-destructive">缺货</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "categoryName",
      header: "分类",
      cell: ({ row }) => (
        <div className="bg-primary-50 text-primary-700 rounded px-2 py-1 text-xs font-medium">
          {row.original.categoryName}
        </div>
      ),
    },
    {
      accessorKey: "isFeatured",
      header: "推荐",
      cell: ({ row }) => (
        <div>
          {row.original.isFeatured ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
              是
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
              否
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isNew",
      header: "新品",
      cell: ({ row }) => (
        <div>
          {row.original.isNew ? (
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
              是
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">
              否
            </span>
          )}
        </div>
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
      label: "商品名称",
      type: "input",
    },
    {
      column: "categoryId",
      label: "分类",
      type: "select",
      options:
        categories.length > 0
          ? categories.map((category) => ({
              label: category.name || "未命名分类",
              value: String(category.id || "0"),
            }))
          : [{ label: "无分类", value: "0" }],
    },
    {
      column: "minPrice",
      label: "最低价格",
      type: "input",
    },
    {
      column: "maxPrice",
      label: "最高价格",
      type: "input",
    },
  ];

  // 渲染商品表单
  const renderProductForm = (
    onSubmit: (values: ProductFormValues) => Promise<void>,
    isSubmitting: boolean,
    submitButtonText: string,
  ) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品名称</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>分类</FormLabel>
                <Select
                  onValueChange={(value) => {
                    // 确保值不为空
                    const numValue = Number(value);
                    field.onChange(isNaN(numValue) ? 0 : numValue);
                  }}
                  value={String(field.value || 0)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length > 0 ? (
                      <>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={String(category.id || "0")}
                          >
                            {category.name || "未命名分类"}
                          </SelectItem>
                        ))}
                      </>
                    ) : (
                      <SelectItem value="0">无分类</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>价格</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    value={field.value?.toString() || "0"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>库存</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value?.toString() || "0"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseInt(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>折扣 (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    value={field.value?.toString() || "0"}
                    onChange={(e) => {
                      const value =
                        e.target.value === "" ? 0 : parseFloat(e.target.value);
                      field.onChange(isNaN(value) ? 0 : value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>商品图片</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex flex-col items-center gap-4">
                      {previewUrl || field.value ? (
                        <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                          <Image
                            src={previewUrl ?? field.value ?? ""}
                            alt="商品图片预览"
                            width={160}
                            height={160}
                            className="h-full w-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6"
                            onClick={clearUploadedImage}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex h-40 w-40 flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 p-4 text-center hover:bg-accent/50">
                          <Upload className="h-10 w-10 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            拖放或点击上传商品图片
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        id="image-upload"
                      />
                      {!field.value && !previewUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                              上传中...
                            </>
                          ) : (
                            <>选择图片</>
                          )}
                        </Button>
                      )}
                    </div>
                    <input type="hidden" {...field} value={field.value ?? ""} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm">推荐商品</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isNew"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm">新品</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>商品描述</FormLabel>
              <FormControl>
                <Textarea rows={5} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
          <p className="text-muted-foreground">管理商品信息、库存和价格</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          添加商品
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.products ?? []}
        loading={isLoading}
        totalItems={data?.meta.totalProducts}
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
              您确定要删除商品 &quot;{selectedProduct?.name}&quot;
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
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              {isDeleting ? "删除中..." : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建商品对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>添加商品</DialogTitle>
            <DialogDescription>填写以下信息创建新商品。</DialogDescription>
          </DialogHeader>

          {renderProductForm(handleCreateProduct, isCreating, "创建商品")}
        </DialogContent>
      </Dialog>

      {/* 编辑商品对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>编辑商品</DialogTitle>
            <DialogDescription>修改商品信息。</DialogDescription>
          </DialogHeader>

          {renderProductForm(handleUpdateProduct, isUpdating, "更新商品")}
        </DialogContent>
      </Dialog>
    </div>
  );
}
