"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ProductCard } from "~/components/ProductCard";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

const PRODUCTS_PER_PAGE = 4;
const AUTO_ROTATE_INTERVAL = 5000; // 5 seconds

export function FeaturedProducts() {
  const [currentPage, setCurrentPage] = useState(0);
  const { data: products, isLoading } =
    api.product.fetchFeaturedProducts.useQuery();

  const totalPages = Math.ceil(products?.length ?? 0 / PRODUCTS_PER_PAGE);

  const handlePrevPage = () => {
    if (!products?.length) return;

    setCurrentPage((prev) =>
      prev === 0 ? Math.max(totalPages - 1, 0) : prev - 1,
    );
  };

  const handleNextPage = useCallback(() => {
    if (!products?.length) return;

    const nextPage = currentPage + 1;
    const hasNextPageContent =
      nextPage < totalPages &&
      products.slice(
        nextPage * PRODUCTS_PER_PAGE,
        (nextPage + 1) * PRODUCTS_PER_PAGE,
      ).length > 0;

    setCurrentPage(hasNextPageContent ? nextPage : 0);
  }, [currentPage, products, totalPages]);

  useEffect(() => {
    if (!products?.length || totalPages <= 1) return;

    const interval = setInterval(() => {
      handleNextPage();
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, [currentPage, handleNextPage, products, totalPages]);

  const visibleProducts = products?.slice(
    currentPage * PRODUCTS_PER_PAGE,
    (currentPage + 1) * PRODUCTS_PER_PAGE,
  );

  return (
    <section className="px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold">特色商品</h2>
            <p className="text-muted-foreground">探索校园生活所需的一切商品</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handlePrevPage}
              disabled={isLoading || !products?.length || totalPages <= 1}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleNextPage}
              disabled={isLoading || !products?.length || totalPages <= 1}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-[360px] animate-pulse rounded-md"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleProducts?.map((product) => (
              <div key={product.id} className="animate-fade-in opacity-0">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl ?? ""}
                  category={product.category ?? ""}
                  isNew={product.isNew}
                  isFeatured={product.isFeatured}
                  discount={product.discount}
                  sellerName={product.sellerName ?? ""}
                  rating={product.rating}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
