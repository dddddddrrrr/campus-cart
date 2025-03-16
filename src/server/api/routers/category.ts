import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  fetchCategories: publicProcedure.query(async ({ ctx }) => {
    // Fetch categories from the database
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
});
