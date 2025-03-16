"use client";

import { ShoppingBagIcon } from "lucide-react";
import { CategoryCard } from "~/components/CategoryCard";
import { getIconByName, getColorByIconName } from "~/components/ui/icons-map";

interface CategoryContentProps {
  categories: Category[];
}

interface Category {
  id: number;
  name: string;
  icon: string | null;
  productCount: number;
}

const CategoryContent = ({ categories }: CategoryContentProps) => {
  return (
    <div className="container mx-auto mt-10 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-3 text-3xl font-bold">所有分类</h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          浏览所有商品分类，找到您需要的校园好物
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {/* 所有商品分类 */}
        <div className="animate-fade-in">
          <CategoryCard
            id={0}
            name="所有商品"
            icon={<ShoppingBagIcon className="h-6 w-6 text-gray-600" />}
            count={categories.reduce(
              (sum, cat) => sum + (cat.productCount ?? 0),
              0,
            )}
            color="bg-gray-50"
          />
        </div>

        {/* 动态生成的分类 */}
        {categories.map((category) => {
          return (
            <div key={category.id} className={`animate-fade-in opacity-0`}>
              <CategoryCard
                id={category.id}
                name={category.name}
                icon={getIconByName(category.icon)}
                count={category.productCount ?? 0}
                color={getColorByIconName(category.icon)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryContent;
