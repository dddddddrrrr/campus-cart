import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";

export const categoryRouter = createTRPCRouter({
  fetchCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
        icon: true,
        products: true,
      },
    });

    return categories.map((category) => {
      return {
        id: category.id,
        name: category.name,
        icon: category.icon,
        productCount: category.products.length,
      };
    });
  }),

  fetchCategoriesWithoutProducts: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        icon: true,
      },
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
    }));
  }),
  fetchCategoryById: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const category = await ctx.db.category.findUnique({
        where: {
          id: input,
        },
        select: {
          id: true,
          name: true,
        },
      });
      return category;
    }),
});
