"use client";

import { useState, useEffect } from "react";
import { CategoryCard } from "~/components/CategoryCard";
import { getIconByName, getColorByIconName } from "~/components/ui/icons-map";
import { api } from "~/trpc/react";

type CategoryWithUI = {
  id: number;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
};

export function CategoriesSection() {
  const [error, setError] = useState<string | null>(null);

  // Use tRPC query instead of fetch
  const { data: categoriesData, isLoading } =
    api.category.fetchCategories.useQuery();

  const [formattedCategories, setFormattedCategories] = useState<
    CategoryWithUI[]
  >([]);

  useEffect(() => {
    if (categoriesData) {
      try {
        const formatted = categoriesData.map((category) => ({
          id: category.id,
          name: category.name,
          icon: getIconByName(category.icon),
          count: category.productCount,
          color: getColorByIconName(category.icon),
        }));
        setFormattedCategories(formatted);
      } catch (err) {
        console.error("Error formatting categories:", err);
        setError("Failed to process categories data");
      }
    }
  }, [categoriesData]);

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-bold">商品分类</h2>
          <p className="mx-auto max-w-lg text-muted-foreground">
            浏览我们广泛的分类，找到您需要的
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-8">
            {formattedCategories.map((category, index) => {
              // 使用预定义的延迟类名
              const delayClasses = [
                "delay-0",
                "delay-100",
                "delay-200",
                "delay-300",
                "delay-400",
              ];
              const delayClass = delayClasses[index % 5];

              return (
                <div
                  key={category.id}
                  className={`animate-fade-in opacity-0 ${delayClass}`}
                >
                  <CategoryCard
                    id={category.id}
                    name={category.name}
                    icon={category.icon}
                    count={category.count}
                    color={category.color}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
