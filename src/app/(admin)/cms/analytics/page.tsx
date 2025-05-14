"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { api } from "~/trpc/react";
import { DataTable } from "~/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { type Filter, type FilterValues } from "~/components/ui/data-table/data-table";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { formatDate, formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";
import { type OrderStatus } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ArrowUpDown,
  CreditCard,
  DollarSign,
  Eye,
  Package,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserCheck,
} from "lucide-react";
import { Tabs, TabsContent } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import Image from "next/image";

// 订单类型定义
type Order = {
  id: number;
  orderNumber: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  status: OrderStatus;
  totalAmount: number | { toString(): string };
  itemCount: number;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
};

type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number | { toString(): string };
};



// 订单状态映射
const orderStatusMap: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "待付款",
    color: "bg-yellow-100 text-yellow-800",
    icon: <CreditCard className="h-4 w-4" />,
  },
  PAID: {
    label: "已付款",
    color: "bg-blue-100 text-blue-800",
    icon: <DollarSign className="h-4 w-4" />,
  },
  PROCESSING: {
    label: "处理中",
    color: "bg-purple-100 text-purple-800",
    icon: <Package className="h-4 w-4" />,
  },
  SHIPPED: {
    label: "已发货",
    color: "bg-indigo-100 text-indigo-800",
    icon: <Truck className="h-4 w-4" />,
  },
  DELIVERED: {
    label: "已送达",
    color: "bg-green-100 text-green-800",
    icon: <ShoppingBag className="h-4 w-4" />,
  },
  COMPLETED: {
    label: "已完成",
    color: "bg-green-100 text-green-800",
    icon: <UserCheck className="h-4 w-4" />,
  },
  CANCELLED: {
    label: "已取消",
    color: "bg-red-100 text-red-800",
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  REFUNDED: {
    label: "已退款",
    color: "bg-gray-100 text-gray-800",
    icon: <CreditCard className="h-4 w-4" />,
  },
};

export default function SalesAnalyticsPage() {
  // 状态管理
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [orderNumber, setOrderNumber] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<OrderStatus | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // 获取订单列表数据
  const { data, isLoading, refetch } = api.order.adminFetchOrders.useQuery({
    page,
    pageSize,
    orderNumber,
    status,
    sortBy: sortBy as "createdAt" | "totalAmount" | "updatedAt",
    sortOrder,
  });

  // 获取订单详情
  const { data: orderDetail, isLoading: isLoadingDetail } =
    api.order.getOrderDetail.useQuery(
      { orderId: selectedOrderId ?? 0 },
      { enabled: selectedOrderId !== null },
    );

  // 更新订单状态的mutation
  const { mutateAsync: updateOrderStatusMutation } =
    api.order.updateOrderStatus.useMutation({
      onSuccess: () => {
        void refetch();
      },
    });

  // 处理搜索
  const handleSearch = (values: FilterValues) => {
    setOrderNumber(values.orderNumber as string);
    setStatus(values.status as OrderStatus | undefined);
    setPage(1); // 重置到第一页
  };

  // 打开订单详情对话框
  const openDetailDialog = (orderId: number) => {
    setSelectedOrderId(orderId);
    setIsDetailDialogOpen(true);
  };

  // 处理更新订单状态
  const handleUpdateOrderStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    await updateOrderStatusMutation({
      orderId,
      status: newStatus,
    });
  };

  // 使用useMemo缓存分页配置对象
  const paginationConfig = useMemo(
    () => ({
      page,
      pageSize,
      pageCount: data?.meta.totalPages ?? 0,
      total: data?.meta.totalOrders ?? 0,
      onPageChange: setPage,
      onPageSizeChange: setPageSize,
    }),
    [page, pageSize, data?.meta.totalPages, data?.meta.totalOrders],
  );

  // 使用useMemo缓存默认筛选值
  const defaultFilterValues = useMemo(
    () => ({
      orderNumber: orderNumber ?? "",
      status: status ?? "",
    }),
    [orderNumber, status],
  );

  // 表格列定义
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "订单编号",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.orderNumber}</div>
      ),
    },
    {
      accessorKey: "userName",
      header: "客户",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.userName ?? "未知用户"}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.userEmail}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <div className="flex items-center">
          金额
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-4 w-4 p-0"
            onClick={() => {
              setSortBy("totalAmount");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              column.toggleSorting(sortOrder === "asc");
            }}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          ¥
          {typeof row.original.totalAmount === "object"
            ? row.original.totalAmount.toString()
            : Number(row.original.totalAmount).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusInfo = orderStatusMap[status];
        return (
          <Badge className={statusInfo.color}>
            <span className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </Badge>
        );
      },
    },
    {
      accessorKey: "itemCount",
      header: "商品数量",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.itemCount}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <div className="flex items-center">
          下单时间
          <Button
            variant="ghost"
            size="sm"
            className="ml-1 h-4 w-4 p-0"
            onClick={() => {
              setSortBy("createdAt");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              column.toggleSorting(sortOrder === "asc");
            }}
          >
            <ArrowUpDown className="h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm")}
          <div className="text-xs">
            {formatDistanceToNow(new Date(row.original.createdAt), {
              addSuffix: true,
              locale: zhCN,
            })}
          </div>
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
            onClick={() => openDetailDialog(row.original.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            查看详情
          </Button>
        </div>
      ),
    },
  ];

  // 筛选条件定义
  const filters: Filter[] = [
    {
      column: "orderNumber",
      label: "订单编号",
      type: "input",
    },
    {
      column: "status",
      label: "订单状态",
      type: "select",
      options: [
        { label: "全部状态", value: "" },
        ...Object.entries(orderStatusMap).map(([value, { label }]) => ({
          label,
          value,
        })),
      ],
    },
  ];

  // 渲染统计卡片
  const renderStatCards = () => {
    if (isLoading || !data) {
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-full" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const stats = data.stats;
    const totalAmount = Object.values(stats.statusCounts).reduce(
      (sum, stat) => sum + Number(stat.totalAmount ?? 0),
      0,
    );

    const completedAmount = Number(
      stats.statusCounts.COMPLETED?.totalAmount ?? 0,
    );
    const pendingAmount = Number(stats.statusCounts.PENDING?.totalAmount ?? 0);

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总销售额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">全部订单</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              已完成订单金额
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{completedAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.statusCounts.COMPLETED?.count ?? 0} 个已完成订单
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待付款金额</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.statusCounts.PENDING?.count ?? 0} 个待付款订单
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订单总数</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrderCount}</div>
            <p className="text-xs text-muted-foreground">全部订单</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // 渲染订单状态统计
  const renderOrderStatusStats = () => {
    if (isLoading || !data) {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-5 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    const stats = data.stats;

    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>订单状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(orderStatusMap).map(([status, info]) => {
                const count =
                  stats.statusCounts[status as OrderStatus]?.count ?? 0;
                const percentage =
                  stats.totalOrderCount > 0
                    ? (count / stats.totalOrderCount) * 100
                    : 0;

                return (
                  <div key={status} className="flex items-center">
                    <div
                      className={`mr-2 h-2 w-2 rounded-full ${info.color.split(" ")[0]}`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {info.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count} 个订单
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                        <div
                          className={`h-2 rounded-full ${info.color.split(" ")[0]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>订单金额分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(orderStatusMap).map(([status, info]) => {
                const amount = Number(
                  stats.statusCounts[status as OrderStatus]?.totalAmount ?? 0,
                );
                const totalAmount = Object.values(stats.statusCounts).reduce(
                  (sum, stat) => sum + Number(stat.totalAmount ?? 0),
                  0,
                );
                const percentage =
                  totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

                return (
                  <div key={status} className="flex items-center">
                    <div
                      className={`mr-2 h-2 w-2 rounded-full ${info.color.split(" ")[0]}`}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {info.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ¥{amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 w-full rounded-full bg-secondary">
                        <div
                          className={`h-2 rounded-full ${info.color.split(" ")[0]}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">销售统计</h1>
        <p className="text-muted-foreground">查看销售数据和订单管理</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="overview" className="space-y-6">
          {renderStatCards()}
          {renderOrderStatusStats()}
        </TabsContent>
        <TabsContent value="orders">
          <DataTable
            columns={columns}
            data={data?.orders ?? []}
            loading={isLoading}
            totalItems={data?.meta.totalOrders}
            filters={filters}
            onSearch={handleSearch}
            defaultValues={defaultFilterValues}
            pagination={paginationConfig}
          />
        </TabsContent>
      </Tabs>

      {/* 订单详情对话框 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>订单详情</DialogTitle>
            <DialogDescription>查看订单详细信息和商品列表</DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-6 w-1/4" />
              <div className="mt-6 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : orderDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    订单信息
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">订单编号:</span>{" "}
                      {orderDetail.orderNumber}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">下单时间:</span>{" "}
                      {formatDate(
                        new Date(orderDetail.createdAt),
                        "yyyy-MM-dd HH:mm:ss",
                      )}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">状态:</span>{" "}
                      <Badge
                        className={orderStatusMap[orderDetail.status].color}
                      >
                        <span className="flex items-center gap-1">
                          {orderStatusMap[orderDetail.status].icon}
                          {orderStatusMap[orderDetail.status].label}
                        </span>
                      </Badge>
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    客户信息
                  </h3>
                  <div className="mt-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">姓名:</span>{" "}
                      {orderDetail.userName ?? "未知"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">邮箱:</span>{" "}
                      {orderDetail.userEmail ?? "未知"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">用户ID:</span>{" "}
                      {orderDetail.userId}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  商品列表
                </h3>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 gap-2 border-b bg-muted/50 p-2 text-sm font-medium">
                    <div className="col-span-5">商品</div>
                    <div className="col-span-2">单价</div>
                    <div className="col-span-2">数量</div>
                    <div className="col-span-3 text-right">小计</div>
                  </div>
                  <div className="divide-y">
                    {orderDetail.items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 p-2 text-sm"
                      >
                        <div className="col-span-5 flex items-center gap-2">
                          {item.productImage ? (
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <span className="line-clamp-2">
                            {item.productName}
                          </span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          ¥{typeof item.unitPrice === "object" 
                            ? item.unitPrice.toString() 
                            : Number(item.unitPrice).toFixed(2)}
                        </div>
                        <div className="col-span-2 flex items-center">
                          {item.quantity}
                        </div>
                        <div className="col-span-3 flex items-center justify-end font-medium">
                          ¥{typeof item.subtotal === "object"
                            ? item.subtotal
                            : Number(item.subtotal).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <div>
                  <Select
                    value={orderDetail.status}
                    onValueChange={(value) =>
                      handleUpdateOrderStatus(
                        orderDetail.id,
                        value as OrderStatus,
                      )
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="更新订单状态" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(orderStatusMap).map(
                        ([value, { label, icon }]) => (
                          <SelectItem key={value} value={value}>
                            <div className="flex items-center gap-2">
                              {icon}
                              {label}
                            </div>
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">总计</div>
                  <div className="text-2xl font-bold">
                    ¥
                    {typeof orderDetail.totalAmount === "object"
                      ? orderDetail.totalAmount.toString()
                      : Number(orderDetail.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              未找到订单信息
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
