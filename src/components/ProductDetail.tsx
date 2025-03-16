"use client";

import { type Product } from "@prisma/client";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { StarIcon, ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface ProductDetailProps {
  product: Product | null;
}

const ProductDetail = ({ product }: ProductDetailProps) => {
  const { data: categoryName } = api.category.fetchCategoryById.useQuery(
    product?.categoryId ?? 0,
  );

  if (!product) {
    return (
      <div className="container mx-auto flex h-[70vh] items-center justify-center px-4 py-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">商品未找到</h2>
          <p className="mb-6 text-muted-foreground">
            抱歉，我们找不到您请求的商品
          </p>
          <Link href="/category/0">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回商品列表
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // 计算折扣后价格
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // 提取卖家信息
  const sellerName =
    product.description?.split("由 ")[1]?.replace(" 提供", "") ?? "未知卖家";

  // 格式化价格
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(price);
  };

  // 生成星级评分
  const renderRating = (rating: number | null) => {
    if (!rating) return null;

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={cn(
              "h-4 w-4",
              i < Math.floor(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300",
            )}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto mt-8 px-4 py-8">
      <div className="mb-6">
        <Link
          href="/category/0"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回商品列表
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 左侧图片区域 */}
          <div className="relative flex h-full min-h-[400px] items-center justify-center overflow-hidden rounded-xl bg-gray-50 p-4 md:min-h-[600px]">
            <Image
              src={product.imageUrl ?? ""}
              alt={product.name}
              width={600}
              height={800}
              className="h-auto max-h-[500px] w-auto max-w-full object-contain"
              priority
            />
            {product.isNew && (
              <Badge className="absolute left-6 top-6 bg-green-500 text-white">
                新品
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="absolute left-6 top-16 bg-purple-500 text-white">
                精选
              </Badge>
            )}
            {product.discount > 0 && (
              <Badge className="absolute right-6 top-6 bg-red-500 text-white">
                {product.discount}% 折扣
              </Badge>
            )}
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                {categoryName?.name ? `${categoryName?.name}` : "未分类"}
              </Badge>
              {product.stock && product.stock > 0 ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 px-2 py-1 text-xs text-green-700"
                >
                  有库存
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="bg-red-50 px-2 py-1 text-xs text-red-700"
                >
                  缺货
                </Badge>
              )}
            </div>

            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              {product.name}
            </h1>

            <div className="mb-4 flex items-center gap-2">
              {renderRating(product.rating ?? 0)}
              {product.rating && (
                <span className="text-sm text-muted-foreground">
                  ({Math.floor(Math.random() * 100) + 10} 条评价)
                </span>
              )}
            </div>

            <div className="mb-6 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(discountedPrice)}
              </span>
              {product.discount > 0 && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <Separator className="mb-6" />

            <div className="mb-6 space-y-4">
              <div>
                <h3 className="mb-2 font-medium">卖家信息</h3>
                <p className="text-sm text-muted-foreground">{sellerName}</p>
              </div>

              <div>
                <h3 className="mb-2 font-medium">商品描述</h3>
                <p className="text-sm text-muted-foreground">
                  {product.description ?? "暂无商品描述"}
                </p>
              </div>

              {product.stock !== null && (
                <div>
                  <h3 className="mb-2 font-medium">库存状态</h3>
                  <p className="text-sm text-muted-foreground">
                    {product.stock > 0
                      ? `库存: ${product.stock} 件`
                      : "当前缺货"}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" className="w-full">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  加入购物车
                </Button>
                <Button size="lg" variant="secondary" className="w-full">
                  立即购买
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" size="sm">
                  <Heart className="mr-2 h-4 w-4" />
                  收藏
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  分享
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
