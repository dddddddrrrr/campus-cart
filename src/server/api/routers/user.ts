import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";
import bcrypt from "bcrypt";

export const userRouter = createTRPCRouter({
  fetchUserProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findFirst({
      where: {
        id: ctx.session?.user.id,
      },
    });
    return user;
  }),

  fetchAllUsers: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(10),
        email: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      // 构建查询条件
      const where = {
        ...(input.email
          ? {
              email: {
                contains: input.email,
                mode: "insensitive" as const,
              },
            }
          : {}),
      };

      const skip = (input.page - 1) * input.pageSize;

      // 查询用户列表
      const users = await db.user.findMany({
        where,
        skip,
        take: input.pageSize,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          credit: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // 获取符合条件的总用户数
      const totalUsers = await db.user.count({ where });

      // 计算总页数
      const totalPages = Math.ceil(totalUsers / input.pageSize);

      return {
        users,
        meta: {
          page: input.page,
          pageSize: input.pageSize,
          totalUsers,
          totalPages,
          hasNextPage: input.page < totalPages,
          hasPrevPage: input.page > 1,
        },
      };
    }),

  updateUserCredit: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 检查当前用户是否为管理员
      const currentUser = await db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { role: true },
      });

      if (currentUser?.role !== "ADMIN") {
        throw new Error("只有管理员可以更新用户余额");
      }

      // 更新用户余额
      const updatedUser = await db.user.update({
        where: { id: input.userId },
        data: { credit: input.amount },
        select: {
          id: true,
          name: true,
          email: true,
          credit: true,
          updatedAt: true,
        },
      });

      return {
        success: true,
        user: updatedUser,
        message: "用户余额更新成功",
      };
    }),
  fetchUserCredit: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: { credit: true },
    });
    return user?.credit;
  }),
});
