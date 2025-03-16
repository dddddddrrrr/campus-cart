"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  ChevronDownIcon,
  FilterIcon,
  SearchIcon,
  GridIcon,
  ListIcon,
  ChevronRightIcon,
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { ProductCard } from "./ProductCard";
import { api } from "~/trpc/react";
import {
  BookOpen,
  Laptop,
  Shirt,
  Dumbbell,
  Home,
  GraduationCap,
  Music,
  ShoppingBag,
} from "lucide-react";
import Image from "next/image";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { Slider } from "~/components/ui/slider";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";

interface CategoryPageProps {
  id: string;
}

// Icon mapping for categories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  电子书: <BookOpen className="h-5 w-5 text-blue-500" />,
  电子产品: <Laptop className="h-5 w-5 text-purple-500" />,
  衣物: <Shirt className="h-5 w-5 text-pink-500" />,
  运动用品: <Dumbbell className="h-5 w-5 text-green-500" />,
  家具: <Home className="h-5 w-5 text-orange-500" />,
  课程材料: <GraduationCap className="h-5 w-5 text-red-500" />,
  音乐与乐器: <Music className="h-5 w-5 text-indigo-500" />,
  配件: <ShoppingBag className="h-5 w-5 text-yellow-500" />,
};

// Color mapping for categories
const CATEGORY_COLORS: Record<string, string> = {
  电子书: "bg-blue-50",
  电子产品: "bg-purple-50",
  衣物: "bg-pink-50",
  运动用品: "bg-green-50",
  家具: "bg-orange-50",
  课程材料: "bg-red-50",
  音乐与乐器: "bg-indigo-50",
  配件: "bg-yellow-50",
};

const CategoryPage = ({ id }: CategoryPageProps) => {
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortOption, setSortOption] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [showNewOnly, setShowNewOnly] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);

  // 从 localStorage 获取视图偏好
  useEffect(() => {
    // 仅在客户端执行
    if (typeof window !== "undefined") {
      const savedViewPreference = localStorage.getItem("productViewPreference");
      if (savedViewPreference) {
        setIsGridView(savedViewPreference === "grid");
      }
    }
  }, []);

  // 保存视图偏好到 localStorage
  const handleViewChange = (isGrid: boolean) => {
    setIsGridView(isGrid);
    if (typeof window !== "undefined") {
      localStorage.setItem("productViewPreference", isGrid ? "grid" : "list");
    }
  };

  // Close filter dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch categories
  const { data: categories = [] } = api.category.fetchCategories.useQuery();

  // Parse category ID
  const categoryId = parseInt(id);

  // Fetch products based on category ID
  const { data: categoryProducts = [], isLoading: isCategoryProductsLoading } =
    api.product.fetchProductsByCategoryId.useQuery(categoryId, {
      // Only fetch if we have a valid category ID (not 0)
      enabled: categoryId > 0,
    });

  // Fetch all products (used when categoryId is 0)
  const { data: allProducts = [], isLoading: isAllProductsLoading } =
    api.product.fetchProducts.useQuery();

  // Determine which products to use based on category ID
  const products = categoryId === 0 ? allProducts : categoryProducts;
  const isLoading =
    categoryId === 0 ? isAllProductsLoading : isCategoryProductsLoading;

  // Find the current category
  const currentCategory = categories.find((cat) => cat.id === categoryId) ?? {
    id: 0,
    name: "所有商品",
    icon: "ShoppingBag",
    productCount: allProducts.length,
  };

  // Get min and max price from available products
  const minPrice = Math.min(...products.map((p) => p.price), 0);
  const maxPrice = Math.max(...products.map((p) => p.price), 10000);

  // Initialize price range based on available products
  useEffect(() => {
    if (products.length > 0) {
      setPriceRange([minPrice, maxPrice]);
    }
  }, [products.length, minPrice, maxPrice]);

  // Get the icon for the current category
  const getCategoryIcon = (iconName: string | undefined) => {
    if (!iconName) return <ShoppingBag className="h-5 w-5" />;
    return CATEGORY_ICONS[iconName] ?? <ShoppingBag className="h-5 w-5" />;
  };

  // Get the color for the current category
  const getCategoryColor = (categoryName: string) => {
    return CATEGORY_COLORS[categoryName] ?? "bg-gray-50";
  };

  // Handle price range change
  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange([value[0] ?? 0, value[1] ?? 10000]);
  };

  // Filter products by search query and other filters
  const filteredProducts = products
    .filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter(
      (product) =>
        product.price >= priceRange[0] && product.price <= priceRange[1],
    )
    .filter((product) => !showInStock || (product.stock && product.stock > 0))
    .filter((product) => !showFeaturedOnly || product.isFeatured)
    .filter((product) => !showNewOnly || product.isNew);

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low-high":
        return a.price - b.price;
      case "price-high-low":
        return b.price - a.price;
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "rating-high-low":
        return (b.rating || 0) - (a.rating || 0);
      case "discount-high-low":
        return (b.discount || 0) - (a.discount || 0);
      default:
        return a.isFeatured ? -1 : b.isFeatured ? 1 : 0;
    }
  });

  return (
    <div className="container mx-auto mt-8 px-4 py-8">
      {/* Improved Breadcrumb with separator */}
      <div className="mb-8 rounded-lg border p-4 shadow-sm">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="text-sm font-medium text-primary hover:underline"
              >
                首页
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRightIcon className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-sm font-medium">
                {currentCategory.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Category Header with improved styling */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              getCategoryColor(currentCategory.name),
            )}
          >
            {getCategoryIcon(currentCategory.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {currentCategory.name}
            </h1>
            <p className="text-muted-foreground">
              显示 {sortedProducts.length} 个商品
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
              <Input
                placeholder="在此分类中搜索..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="relative" ref={filterRef}>
              <Button
                variant="outline"
                className="flex gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FilterIcon className="h-4 w-4" />
                筛选
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>

              {showFilters && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border bg-white p-4 shadow-lg">
                  <div className="mb-4">
                    <h3 className="mb-2 font-medium">价格范围</h3>
                    <div className="mb-2 flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        ¥{priceRange[0].toFixed(0)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ¥{priceRange[1].toFixed(0)}
                      </span>
                    </div>
                    <Slider
                      defaultValue={[minPrice, maxPrice]}
                      value={[priceRange[0], priceRange[1]]}
                      min={minPrice}
                      max={maxPrice}
                      step={10}
                      onValueChange={handlePriceRangeChange}
                      className="mb-6"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="in-stock"
                        checked={showInStock}
                        onCheckedChange={(checked) =>
                          setShowInStock(checked === true)
                        }
                      />
                      <Label htmlFor="in-stock">仅显示有库存</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured-only"
                        checked={showFeaturedOnly}
                        onCheckedChange={(checked) =>
                          setShowFeaturedOnly(checked === true)
                        }
                      />
                      <Label htmlFor="featured-only">仅显示精选商品</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="new-only"
                        checked={showNewOnly}
                        onCheckedChange={(checked) =>
                          setShowNewOnly(checked === true)
                        }
                      />
                      <Label htmlFor="new-only">仅显示新品</Label>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-2"
                      onClick={() => {
                        setPriceRange([minPrice, maxPrice]);
                        setShowInStock(false);
                        setShowFeaturedOnly(false);
                        setShowNewOnly(false);
                      }}
                    >
                      重置
                    </Button>
                    <Button size="sm" onClick={() => setShowFilters(false)}>
                      应用
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="whitespace-nowrap text-sm text-muted-foreground">
              排序方式:
            </span>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="rounded-md border bg-background p-2 text-sm">
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">精选</SelectItem>
                <SelectItem value="newest">最新</SelectItem>
                <SelectItem value="price-low-high">价格: 从低到高</SelectItem>
                <SelectItem value="price-high-low">价格: 从高到低</SelectItem>
                <SelectItem value="rating-high-low">评分: 从高到低</SelectItem>
                <SelectItem value="discount-high-low">
                  折扣: 从高到低
                </SelectItem>
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            <Button
              variant={isGridView ? "default" : "ghost"}
              size="icon"
              onClick={() => handleViewChange(true)}
              className="h-8 w-20"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={!isGridView ? "default" : "ghost"}
              size="icon"
              onClick={() => handleViewChange(false)}
              className="h-8 w-20"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products with improved loading state */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        {isLoading ? (
          isGridView ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-[360px] animate-pulse rounded-md"
                />
              ))}
            </div>
          ) : (
            // 列表视图的骨架加载
            <div className="flex flex-col gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="flex overflow-hidden rounded-lg border"
                >
                  <Skeleton className="aspect-square w-1/3 animate-pulse" />
                  <div className="flex-1 p-4">
                    <Skeleton className="mb-2 h-4 w-1/4" />
                    <Skeleton className="mb-2 h-6 w-3/4" />
                    <Skeleton className="mb-4 h-4 w-1/3" />
                    <div className="mt-auto flex items-center justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {sortedProducts.length > 0 ? (
              <div
                className={
                  isGridView
                    ? "grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "flex flex-col gap-4"
                }
              >
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="animate-fade-in opacity-100 transition-opacity duration-300"
                  >
                    {isGridView ? (
                      <ProductCard
                        id={product.id}
                        name={product.name}
                        price={product.price}
                        imageUrl={product.imageUrl ?? ""}
                        category={currentCategory.name}
                        isNew={product.isNew}
                        isFeatured={product.isFeatured}
                        discount={product.discount}
                        sellerName={
                          product.description
                            ?.split("由 ")[1]
                            ?.replace(" 提供", "") ?? "未知卖家"
                        }
                        rating={product.rating}
                      />
                    ) : (
                      <div className="flex overflow-hidden rounded-lg border transition-all hover:shadow-md">
                        <div className="relative aspect-square w-1/3 overflow-hidden">
                          <Image
                            src={product.imageUrl ?? ""}
                            alt={product.name}
                            width={480}
                            height={360}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <span className="text-sm text-muted-foreground">
                            {currentCategory.name}
                          </span>
                          <h3 className="mb-2 text-lg font-medium">
                            {product.name}
                          </h3>
                          <div className="mb-2 flex items-center gap-2">
                            <span className="font-semibold">
                              {new Intl.NumberFormat("zh-CN", {
                                style: "currency",
                                currency: "CNY",
                              }).format(product.price)}
                            </span>
                            {product.discount > 0 && (
                              <span className="text-sm text-muted-foreground line-through">
                                {new Intl.NumberFormat("zh-CN", {
                                  style: "currency",
                                  currency: "CNY",
                                }).format(
                                  product.originalPrice ??
                                    product.price *
                                      (1 + product.discount / 100),
                                )}
                              </span>
                            )}
                          </div>
                          <div className="mt-auto flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              库存: {product.stock ?? "有货"}
                            </span>
                            <Button size="sm">查看详情</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <h3 className="mb-2 text-xl font-medium">未找到商品</h3>
                <p className="text-muted-foreground">
                  请尝试调整搜索或筛选条件
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setPriceRange([minPrice, maxPrice]);
                    setShowInStock(false);
                    setShowFeaturedOnly(false);
                    setShowNewOnly(false);
                    setSortOption("featured");
                  }}
                >
                  重置所有筛选条件
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
