"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { ProductCard } from "~/components/ProductCard";
import { Skeleton } from "~/components/ui/skeleton";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  SlidersHorizontal,
  ArrowDownAZ,
  ArrowUpAZ,
  TrendingUp,
  TrendingDown,
  Percent,
  ShoppingBag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import Link from "next/link";
import { cn } from "~/lib/utils";

type SortOption =
  | "discount-high"
  | "discount-low"
  | "price-high"
  | "price-low"
  | "name-asc"
  | "name-desc";

const DealsContent = () => {
  const [sortOption, setSortOption] = useState<SortOption>("discount-high");

  // 从 API 获取特价商品
  const { data: dealsProducts, isLoading: isDealsProductsLoading } =
    api.product.fetchDealsProducts.useQuery();

  // 初始化时从 localStorage 读取排序选项偏好
  useEffect(() => {
    // 读取排序选项
    const savedSortOption = localStorage.getItem(
      "dealsSortOption",
    ) as SortOption | null;
    if (savedSortOption) {
      setSortOption(savedSortOption);
    }
  }, []);

  // 当排序选项改变时，保存到 localStorage
  const handleSortChange = (value: SortOption) => {
    setSortOption(value);
    localStorage.setItem("dealsSortOption", value);
  };

  // 排序商品
  const sortedProducts = dealsProducts
    ? [...dealsProducts].sort((a, b) => {
        switch (sortOption) {
          case "discount-high":
            return (b.discount || 0) - (a.discount || 0);
          case "discount-low":
            return (a.discount || 0) - (b.discount || 0);
          case "price-high":
            return b.price - a.price;
          case "price-low":
            return a.price - b.price;
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "name-desc":
            return b.name.localeCompare(a.name);
          default:
            return 0;
        }
      })
    : [];

  // 获取排序选项的图标和文本
  const getSortOptionInfo = (option: SortOption) => {
    switch (option) {
      case "discount-high":
        return {
          icon: <Percent className="mr-2 h-4 w-4" />,
          text: "折扣从高到低",
        };
      case "discount-low":
        return {
          icon: <Percent className="mr-2 h-4 w-4" />,
          text: "折扣从低到高",
        };
      case "price-high":
        return {
          icon: <TrendingDown className="mr-2 h-4 w-4" />,
          text: "价格从高到低",
        };
      case "price-low":
        return {
          icon: <TrendingUp className="mr-2 h-4 w-4" />,
          text: "价格从低到高",
        };
      case "name-asc":
        return {
          icon: <ArrowDownAZ className="mr-2 h-4 w-4" />,
          text: "名称 A-Z",
        };
      case "name-desc":
        return {
          icon: <ArrowUpAZ className="mr-2 h-4 w-4" />,
          text: "名称 Z-A",
        };
    }
  };

  // 骨架加载组件 - 网格视图
  const GridSkeleton = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border bg-card shadow-sm"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-4">
            <Skeleton className="mb-1 h-3 w-20" />
            <Skeleton className="mb-2 h-5 w-full" />
            <Skeleton className="mb-4 h-4 w-3/4" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 md:py-16">
      {/* 页面标题 */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <Percent className="h-6 w-6 text-red-500" />
          <h1 className="text-3xl font-bold tracking-tight">今日折扣</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          发现校园里的超值折扣，为您的学习生活省钱
        </p>
      </div>

      {/* 控制栏 */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Badge variant="outline" className="mb-2 px-2 py-1 text-sm">
            {dealsProducts?.length ?? 0} 个特价商品
          </Badge>
          <h2 className="text-xl font-semibold">当前折扣</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* 排序选项 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">排序</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => handleSortChange("discount-high")}
                className={cn(sortOption === "discount-high" && "bg-accent")}
              >
                <Percent className="mr-2 h-4 w-4" />
                <span>折扣从高到低</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("discount-low")}
                className={cn(sortOption === "discount-low" && "bg-accent")}
              >
                <Percent className="mr-2 h-4 w-4" />
                <span>折扣从低到高</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("price-high")}
                className={cn(sortOption === "price-high" && "bg-accent")}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                <span>价格从高到低</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("price-low")}
                className={cn(sortOption === "price-low" && "bg-accent")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>价格从低到高</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("name-asc")}
                className={cn(sortOption === "name-asc" && "bg-accent")}
              >
                <ArrowDownAZ className="mr-2 h-4 w-4" />
                <span>名称 A-Z</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("name-desc")}
                className={cn(sortOption === "name-desc" && "bg-accent")}
              >
                <ArrowUpAZ className="mr-2 h-4 w-4" />
                <span>名称 Z-A</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 当前排序指示器 */}
      <div className="mb-6 flex items-center text-sm text-muted-foreground">
        <span>排序方式:</span>
        <div className="ml-2 flex items-center">
          {getSortOptionInfo(sortOption).icon}
          <span>{getSortOptionInfo(sortOption).text}</span>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* 商品列表 */}
      {isDealsProductsLoading ? (
        <GridSkeleton />
      ) : sortedProducts && sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl ?? ""}
              category={product.category?.name ?? "未分类"}
              isNew={product.isNew}
              discount={product.discount}
              sellerName={
                product.description?.split("由 ")[1]?.replace(" 提供", "") ??
                "未知卖家"
              }
              rating={product.rating ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
          <ShoppingBag className="mb-4 h-12 w-12 text-muted-foreground" />
          <p className="mb-2 text-lg font-medium">暂无特价商品</p>
          <p className="mb-4 text-sm text-muted-foreground">
            目前没有任何折扣商品，请稍后再来查看
          </p>
          <Link href="/category/0">
            <Button variant="outline">浏览所有商品</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DealsContent;
