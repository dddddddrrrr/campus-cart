"use client";

import { api } from "~/trpc/react";
import { ProductCard } from "~/components/ProductCard";

const DealsContent = () => {
  const { data: dealsProducts } = api.product.fetchDealsProducts.useQuery();

  return (
    <div className="px-4 py-16">
      <h1 className="mb-4 text-2xl font-bold">今日折扣</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {dealsProducts?.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            imageUrl={product.imageUrl ?? ""}
            category={product.category.name ?? ""}
            isNew={product.isNew}
            discount={product.discount}
            sellerName={
              product.description?.split("由 ")[1]?.replace(" 提供", "") ??
              "未知卖家"
            }
            rating={product.rating}
          />
        ))}
      </div>
    </div>
  );
};

export default DealsContent;
