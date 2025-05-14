import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { z } from "zod";

// 分类创建和更新的输入验证schema
const categoryInputSchema = z.object({
  name: z.string().min(1, "分类名称不能为空"),
  icon: z.string().optional(),
});

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
          icon: true,
        },
      });

      if (!category) {
        throw new Error("分类不存在");
      }

      return category;
    }),

  // 管理员获取分类列表（带分页和筛选）
  adminFetchCategories: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(10),
        name: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const { page, pageSize, name } = input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where = {
        ...(name ? { name: { contains: name } } : {}),
      };

      // 查询分类
      const categories = await ctx.db.category.findMany({
        where,
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      });

      // 获取符合条件的总分类数
      const totalCategories = await ctx.db.category.count({ where });

      // 计算总页数
      const totalPages = Math.ceil(totalCategories / pageSize);

      return {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          productCount: category._count.products,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
        meta: {
          page,
          pageSize,
          totalCategories,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }),

  // 创建分类
  createCategory: protectedProcedure
    .input(categoryInputSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      // 检查分类名称是否已存在
      const existingCategory = await ctx.db.category.findFirst({
        where: { name: input.name },
      });

      if (existingCategory) {
        throw new Error("分类名称已存在");
      }

      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          icon: input.icon,
        },
      });

      return {
        success: true,
        message: "分类创建成功",
        category,
      };
    }),

  // 更新分类
  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: categoryInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      // 检查分类是否存在
      const existingCategory = await ctx.db.category.findUnique({
        where: { id: input.id },
      });

      if (!existingCategory) {
        throw new Error("分类不存在");
      }

      // 如果要更新名称，检查新名称是否与其他分类冲突
      if (input.data.name && input.data.name !== existingCategory.name) {
        const nameConflict = await ctx.db.category.findFirst({
          where: {
            name: input.data.name,
            id: { not: input.id },
          },
        });

        if (nameConflict) {
          throw new Error("分类名称已存在");
        }
      }

      // 更新分类
      const updatedCategory = await ctx.db.category.update({
        where: { id: input.id },
        data: input.data,
      });

      return {
        success: true,
        message: "分类更新成功",
        category: updatedCategory,
      };
    }),

  // 删除分类
  deleteCategory: protectedProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      // 检查分类是否存在
      const existingCategory = await ctx.db.category.findUnique({
        where: { id: input },
        include: {
          _count: {
            select: {
              products: true,
            },
          },
        },
      });

      if (!existingCategory) {
        throw new Error("分类不存在");
      }

      // 检查分类下是否有商品
      if (existingCategory._count.products > 0) {
        throw new Error("该分类下还有商品，无法删除");
      }

      // 删除分类
      await ctx.db.category.delete({
        where: { id: input },
      });

      return {
        success: true,
        message: "分类删除成功",
      };
    }),
});
