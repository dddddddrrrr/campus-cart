import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const userRouter = createTRPCRouter({
  fetchUserProfile: publicProcedure.query(async ({ ctx }) => {
    const user = await db.user.findFirst({
      where: {
        id: ctx.session?.user.id,
      },
    });
    return user;
  }),
});
