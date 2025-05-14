import { type Prisma } from "@prisma/client";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

// 商品创建和更新的输入验证schema
const productInputSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  description: z.string().optional(),
  price: z.number().min(0, "价格不能为负数"),
  stock: z.number().int().min(0, "库存不能为负数"),
  categoryId: z.number().int().positive("请选择有效的分类"),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional().default(false),
  isNew: z.boolean().optional().default(true),
  discount: z.number().min(0).max(100).optional().default(0),
  rating: z.number().min(0).max(5).optional().default(0),
});

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

  fetchNewProducts: publicProcedure.query(async ({ ctx }) => {
    const newProducts = await ctx.db.product.findMany({
      where: {
        isNew: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // 限制返回的商品数量，避免返回过多数据
    });
    return newProducts;
  }),

  searchProducts: publicProcedure
    .input(
      z.object({
        query: z.string(),
        limit: z.number().min(1).max(100).optional().default(20),
        categoryId: z.number().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
        includeOutOfStock: z.boolean().optional().default(true),
        sortBy: z
          .enum(["price", "newest", "rating", "discount"])
          .optional()
          .default("newest"),
        sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        query,
        limit,
        categoryId,
        minPrice,
        maxPrice,
        includeOutOfStock,
        sortBy,
        sortOrder,
      } = input;

      // 构建排序条件
      let orderBy = {};
      switch (sortBy) {
        case "price":
          orderBy = { price: sortOrder };
          break;
        case "newest":
          orderBy = { createdAt: sortOrder };
          break;
        case "rating":
          orderBy = { rating: sortOrder };
          break;
        case "discount":
          orderBy = { discount: sortOrder };
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      // 首先查找名称中包含查询字符串的分类
      const matchingCategories = await ctx.db.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          name: true,
        },
      });

      const categoryIds = matchingCategories.map((category) => category.id);

      // 构建查询条件
      const whereClause = {
        OR: [
          // 按产品名称搜索
          {
            name: {
              contains: query,
              mode: "insensitive", // 不区分大小写
            },
          },
          // 按产品描述搜索
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          // 按分类ID搜索（如果有匹配的分类）
          ...(categoryIds.length > 0
            ? [
                {
                  categoryId: {
                    in: categoryIds,
                  },
                },
              ]
            : []),
          // 查找分类名称中包含查询字符串的产品
          {
            category: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
        // 只有当设置了categoryId时才添加这个条件
        ...(categoryId !== undefined && { categoryId }),
        // 价格范围过滤
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
        // 库存过滤
        ...(includeOutOfStock === false && { stock: { gt: 0 } }),
      };

      // 执行查询
      const products = await ctx.db.product.findMany({
        where: whereClause as Prisma.ProductWhereInput,
        include: {
          category: true,
        },
        orderBy,
        take: limit,
      });

      // 如果没有找到产品，但有匹配的分类，获取这些分类中的所有产品
      if (products.length === 0 && categoryIds.length > 0) {
        const categoryProducts = await ctx.db.product.findMany({
          where: {
            categoryId: {
              in: categoryIds,
            },
            ...(includeOutOfStock === false && { stock: { gt: 0 } }),
          },
          include: {
            category: true,
          },
          orderBy,
          take: limit,
        });

        return categoryProducts.map((product) => ({
          ...product,
          categoryName: product.category.name,
        }));
      }

      // 转换结果
      return products.map((product) => ({
        ...product,
        categoryName: product.category.name,
      }));
    }),

  // 管理端分页获取商品列表，支持筛选
  adminFetchProducts: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(10),
        name: z.string().optional(),
        categoryId: z.number().int().optional(),
        minPrice: z.number().min(0).optional(),
        maxPrice: z.number().min(0).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const { page, pageSize, name, categoryId, minPrice, maxPrice } = input;
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where = {
        ...(name
          ? {
              name: {
                contains: name,
                mode: "insensitive" as const,
              },
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(minPrice !== undefined || maxPrice !== undefined
          ? {
              price: {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
              },
            }
          : {}),
      };

      // 查询商品
      const products = await ctx.db.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: pageSize,
      });

      // 获取符合条件的总商品数
      const totalProducts = await ctx.db.product.count({ where });

      // 计算总页数
      const totalPages = Math.ceil(totalProducts / pageSize);

      return {
        products: products.map((product) => ({
          ...product,
          categoryName: product.category.name,
        })),
        meta: {
          page,
          pageSize,
          totalProducts,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    }),

  // 创建商品
  createProduct: protectedProcedure
    .input(productInputSchema)
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const product = await ctx.db.product.create({
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          stock: input.stock,
          categoryId: input.categoryId,
          imageUrl: input.imageUrl,
          isFeatured: input.isFeatured,
          isNew: input.isNew,
          discount: input.discount,
          rating: input.rating,
          originalPrice: input.price,
        },
      });

      return {
        success: true,
        message: "商品创建成功",
        product,
      };
    }),

  // 更新商品
  updateProduct: protectedProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        data: productInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      // 检查商品是否存在
      const existingProduct = await ctx.db.product.findUnique({
        where: { id: input.id },
      });

      if (!existingProduct) {
        throw new Error("商品不存在");
      }

      // 更新商品
      const updatedProduct = await ctx.db.product.update({
        where: { id: input.id },
        data: input.data,
      });

      return {
        success: true,
        message: "商品更新成功",
        product: updatedProduct,
      };
    }),

  // 删除商品
  deleteProduct: protectedProcedure
    .input(z.number().int().positive())
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      // 检查商品是否存在
      const existingProduct = await ctx.db.product.findUnique({
        where: { id: input },
      });

      if (!existingProduct) {
        throw new Error("商品不存在");
      }

      // 删除商品
      await ctx.db.product.delete({
        where: { id: input },
      });

      return {
        success: true,
        message: "商品删除成功",
      };
    }),

  // 获取单个商品详情（管理端）
  adminFetchProductById: protectedProcedure
    .input(z.number().int().positive())
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const product = await ctx.db.product.findUnique({
        where: { id: input },
        include: {
          category: true,
        },
      });

      if (!product) {
        throw new Error("商品不存在");
      }

      return {
        ...product,
        categoryName: product.category.name,
      };
    }),
});
