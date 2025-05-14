import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";

// 订单状态筛选的输入验证schema
const orderStatusSchema = z.nativeEnum(OrderStatus).optional();

export const orderRouter = createTRPCRouter({
  // 获取当前用户的订单
  getOrder: protectedProcedure.query(async ({ ctx }) => {
    const orders = await ctx.db.order.findMany({
      where: {
        userId: ctx.session?.user.id,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return orders;
  }),

  // 管理员获取所有订单（带分页和筛选）
  adminFetchOrders: protectedProcedure
    .input(
      z.object({
        page: z.number().int().positive().default(1),
        pageSize: z.number().int().positive().default(10),
        orderNumber: z.string().optional(),
        status: orderStatusSchema,
        userId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        sortBy: z.enum(['createdAt', 'totalAmount', 'updatedAt']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      }),
    )
    .query(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const { 
        page, 
        pageSize, 
        orderNumber, 
        status, 
        userId, 
        startDate, 
        endDate,
        sortBy,
        sortOrder
      } = input;
      
      const skip = (page - 1) * pageSize;

      // 构建查询条件
      const where = {
        ...(orderNumber ? { orderNumber: { contains: orderNumber } } : {}),
        ...(status ? { status } : {}),
        ...(userId ? { userId } : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: startDate } : {}),
                ...(endDate ? { lte: endDate } : {}),
              },
            }
          : {}),
      };

      // 查询订单
      const orders = await ctx.db.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: pageSize,
      });

      // 获取符合条件的总订单数
      const totalOrders = await ctx.db.order.count({ where });

      // 计算总页数
      const totalPages = Math.ceil(totalOrders / pageSize);

      // 计算订单统计信息
      const orderStats = await ctx.db.order.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
        where,
      });

      // 格式化订单数据
      const formattedOrders = orders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        userName: order.user.name,
        userEmail: order.user.email,
        status: order.status,
        totalAmount: order.totalAmount,
        itemCount: order.orderItems.length,
        items: order.orderItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));

      return {
        orders: formattedOrders,
        meta: {
          page,
          pageSize,
          totalOrders,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          statusCounts: Object.fromEntries(
            orderStats.map(stat => [
              stat.status,
              {
                count: stat._count.id,
                totalAmount: stat._sum.totalAmount,
              },
            ])
          ),
          totalOrderCount: totalOrders,
        },
      };
    }),

  // 获取订单详情
  getOrderDetail: protectedProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
    }))
    .query(async ({ ctx, input }) => {
      const { orderId } = input;
      
      // 检查是否为管理员或订单所有者
      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("订单不存在");
      }

      // 只有管理员或订单所有者可以查看订单详情
      if (ctx.session.user.role !== "ADMIN" && order.userId !== ctx.session.user.id) {
        throw new Error("没有权限查看此订单");
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
        userName: order.user.name,
        userEmail: order.user.email,
        status: order.status,
        totalAmount: order.totalAmount,
        items: order.orderItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.imageUrl,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: parseFloat((Number(item.unitPrice) * item.quantity).toFixed(2)),
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    }),

  // 更新订单状态
  updateOrderStatus: protectedProcedure
    .input(z.object({
      orderId: z.number().int().positive(),
      status: z.nativeEnum(OrderStatus),
    }))
    .mutation(async ({ ctx, input }) => {
      // 检查权限
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("没有权限执行此操作");
      }

      const { orderId, status } = input;

      // 检查订单是否存在
      const order = await ctx.db.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error("订单不存在");
      }

      // 更新订单状态
      const updatedOrder = await ctx.db.order.update({
        where: { id: orderId },
        data: { status },
      });

      return {
        success: true,
        message: "订单状态更新成功",
        order: updatedOrder,
      };
    }),

  // 用户创建订单
  createOrder: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            productId: z.number().int().positive(),
            quantity: z.number().int().positive(),
          })
        ),
        // 可选参数，如果不提供则使用购物车中的商品
        useCart: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // 获取当前用户
      const userId = ctx.session.user.id;
      
      let orderItems = input.items;
      
      // 如果使用购物车，则获取购物车中的商品
      if (input.useCart) {
        const cart = await ctx.db.cart.findFirst({
          where: { userId },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
        
        if (!cart || cart.items.length === 0) {
          throw new Error("购物车为空");
        }
        
        orderItems = cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }));
      }
      
      if (orderItems.length === 0) {
        throw new Error("订单中没有商品");
      }
      
      // 获取商品详情和计算总价
      const productIds = orderItems.map(item => item.productId);
      const products = await ctx.db.product.findMany({
        where: {
          id: {
            in: productIds,
          },
        },
      });
      
      // 检查库存
      for (const item of orderItems) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`商品ID ${item.productId} 不存在`);
        }
        
        if (product.stock < item.quantity) {
          throw new Error(`商品 ${product.name} 库存不足，当前库存: ${product.stock}`);
        }
      }
      
      // 计算订单总金额
      let totalAmount = 0;
      const orderItemsWithPrice = orderItems.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;
        
        return {
          ...item,
          unitPrice: product.price,
          productName: product.name,
        };
      });
      
      // 检查用户余额是否足够
      const user = await ctx.db.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new Error("用户不存在");
      }
      
      if (user.credit < totalAmount) {
        throw new Error(`余额不足，当前余额: ¥${user.credit.toFixed(2)}, 订单金额: ¥${totalAmount.toFixed(2)}`);
      }
      
      // 使用事务确保数据一致性
      return await ctx.db.$transaction(async (tx) => {
        // 1. 创建订单
        const orderNumber = generateOrderNumber();
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: "PENDING",
            totalAmount,
            orderItems: {
              create: orderItemsWithPrice.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              })),
            },
          },
          include: {
            orderItems: true,
          },
        });
        
        // 2. 扣除用户余额
        await tx.user.update({
          where: { id: userId },
          data: {
            credit: {
              decrement: totalAmount,
            },
          },
        });
        
        // 3. 减少商品库存
        for (const item of orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
        
        // 4. 如果使用购物车，则清空购物车
        if (input.useCart) {
          const cart = await tx.cart.findFirst({
            where: { userId },
          });
          
          if (cart) {
            await tx.cartItem.deleteMany({
              where: { cartId: cart.id },
            });
          }
        }
        
        return {
          success: true,
          order,
          message: "订单创建成功",
        };
      });
    }),
});

// 生成订单号
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(2); // 年份后两位
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 月份，补零
  const day = now.getDate().toString().padStart(2, '0'); // 日期，补零
  
  // 生成6位随机数
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  
  // 格式：年月日 + 6位随机数
  return `${year}${month}${day}${random}`;
}
