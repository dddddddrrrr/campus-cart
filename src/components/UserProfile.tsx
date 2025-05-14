"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

import { Progress } from "~/components/ui/progress";
import { useRouter } from "next/navigation";
import {
  UserIcon,
  PackageIcon,
  MapPinIcon,
  ShoppingBagIcon,
  ClockIcon,
  SettingsIcon,
} from "lucide-react";

import { api } from "~/trpc/react";
import { useSession } from "next-auth/react";
import { formatDate } from "~/lib/utils";

const UserProfile = () => {
  const { data: session } = useSession();
  const { data: user } = api.user.fetchUserProfile.useQuery(undefined, {
    enabled: !!session,
  });
  const router = useRouter();
  const { data: orders } = api.order.getOrder.useQuery(undefined, {
    enabled: !!session,
  });

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            待处理
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            处理中
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            已发货
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            已送达
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            已取消
          </Badge>
        );
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  return (
    <div className="container mx-auto mt-24 max-w-6xl py-6">
      <h1 className="mb-8 text-center text-3xl font-bold">个人中心</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* 左侧用户信息区域 */}
        <div className="flex w-full max-w-md flex-col gap-8 md:col-span-1 lg:col-span-1">
          {/* 用户信息卡片 */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
              <div className="relative h-16 w-16 overflow-hidden rounded-full bg-primary/10">
                {session?.user?.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "用户头像"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <CardTitle>{user?.name ?? "未设置姓名"}</CardTitle>
                <CardDescription>{user?.email ?? "未设置邮箱"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 积分与等级 */}
                <div className="rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-primary">余额</span>
                    <span className="text-lg font-bold text-primary">
                      {user?.credit ?? 0}
                    </span>
                  </div>
                  <Progress value={30} className="h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    每消费1元积累1积分
                  </p>
                </div>

                {/* 用户统计信息 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-secondary/20 p-3 text-center">
                    <ShoppingBagIcon className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">{orders?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">订单数</p>
                  </div>
                  <div className="rounded-lg border bg-secondary/20 p-3 text-center">
                    <ClockIcon className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {user?.createdAt ? formatDate(user.createdAt) : "未知"}
                    </p>
                    <p className="text-xs text-muted-foreground">注册日期</p>
                  </div>
                </div>

                {/* 地址信息 */}
                <div className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <MapPinIcon className="h-4 w-4" />
                    <span>地址信息</span>
                  </div>
                  <div className="space-y-2">
                    <div className="rounded-md bg-secondary/20 p-3">
                      <p className="text-sm">暂无地址信息</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        添加地址以便快速下单
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center border-t pt-4">
              <Button variant="outline" size="sm" className="w-full">
                <SettingsIcon className="mr-2 h-4 w-4" /> 编辑个人资料
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex h-full flex-col gap-6 md:col-span-3">
          {/* 订单分类导航 */}
          <div className="flex overflow-x-auto rounded-lg border bg-card p-1">
            <div className="flex flex-1 items-center justify-center rounded-md bg-primary/10 p-2 text-sm font-medium">
              全部订单
            </div>
            <div className="flex flex-1 items-center justify-center p-2 text-sm font-medium text-muted-foreground">
              待付款
            </div>
            <div className="flex flex-1 items-center justify-center p-2 text-sm font-medium text-muted-foreground">
              待发货
            </div>
            <div className="flex flex-1 items-center justify-center p-2 text-sm font-medium text-muted-foreground">
              待收货
            </div>
          </div>

          {/* 订单信息卡片 */}
          <Card className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>我的订单</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                查看全部
              </Button>
            </CardHeader>

            <CardContent className="max-h-[calc(100vh-300px)] space-y-4 overflow-y-auto">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-md border"
                  >
                    <div className="bg-slate-50 p-3 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <PackageIcon className="h-4 w-4 text-primary" />
                          <p className="text-sm font-medium">
                            订单 #{order.id}
                          </p>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                        <span>
                          下单时间:
                          {formatDate(order.createdAt)}
                        </span>
                        <span>
                          金额: ¥
                          {order.orderItems && order.orderItems.length > 0
                            ? order.orderItems
                                .reduce(
                                  (acc, item) =>
                                    acc +
                                    (item.product?.price || 0) *
                                      (item.quantity || 1),
                                  0,
                                )
                                .toFixed(2)
                            : "0.00"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      {order.orderItems && order.orderItems.length > 0 ? (
                        <div className="space-y-3">
                          {order.orderItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3"
                            >
                              <div className="relative h-16 w-16 overflow-hidden rounded-md bg-slate-100">
                                {item.product?.imageUrl && (
                                  <Image
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="line-clamp-1 font-medium">
                                  {item.product?.name}
                                </p>
                                <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                                  <span>x{item.quantity}</span>
                                  <span>
                                    ¥
                                    {(
                                      (item.product?.price || 0) *
                                      (item.quantity || 1)
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-sm text-muted-foreground">
                          暂无订单项目信息
                        </p>
                      )}
                    </div>
                    <div className="border-t bg-slate-50 p-3 text-right">
                      <Button
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/product/${order.orderItems[0]?.product?.id}`,
                          )
                        }
                      >
                        再次购买
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center">
                  <PackageIcon className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-center text-muted-foreground">
                    暂无订单记录
                  </p>
                  <Button
                    className="mt-4"
                    size="sm"
                    onClick={() => router.push("/")}
                  >
                    去浏览商品
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 常用功能区域 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">常用功能</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <ShoppingBagIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-center text-xs">历史订单</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPinIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-center text-xs">地址管理</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <UserIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-center text-xs">个人资料</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <SettingsIcon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-center text-xs">设置</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
