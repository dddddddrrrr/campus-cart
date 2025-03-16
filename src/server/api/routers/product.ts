import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const productRouter = createTRPCRouter({
  fetchProducts: publicProcedure.query(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  }),

  fetchFeaturedProducts: publicProcedure.query(async ({ ctx }) => {
    const featuredProducts = await ctx.db.product.findMany({
      where: {
        isFeatured: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include category name
    return featuredProducts.map((product) => ({
      ...product,
      category: product.category.name,
      sellerName:
        product.description?.split("由 ")[1]?.replace(" 提供", "") ??
        "未知卖家",
    }));
  }),
  fetchProductsByCategoryId: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const products = await ctx.db.product.findMany({
        where: {
          categoryId: input,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return products;
    }),
  fetchProductById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: {
          id: input,
        },
      });
      return product;
    }),

  fetchDealsProducts: publicProcedure.query(async ({ ctx }) => {
    const dealsProducts = await ctx.db.product.findMany({
      where: {
        discount: {
          gt: 0,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        discount: "desc",
      },
      take: 20, // 限制返回的商品数量，避免返回过多数据
    });
    return dealsProducts;
  }),
});
