import { createRouter } from "./context";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const commentRouter = createRouter()
  .query("all-comments", {
    input: z.object({
      permalink: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { permalink } = input;

      try {
        const comments = await ctx.prisma.comment.findMany({
          where: {
            Post: {
              permalink,
            },
          },
          include: {
            user: true,
          },
        });

        return comments;
      } catch (e) {
        console.log(e);
        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
      });
    }

    return next();
  })
  .mutation("add-comment", {
    input: z.object({
      body: z.string(),
      permalink: z.string(),
      parentId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const { body, permalink, parentId } = input;

      const user = ctx.session?.user;

      try {
        const comment = await ctx.prisma.comment.create({
          data: {
            body,
            Post: {
              connect: {
                permalink,
              },
            },
            user: {
              connect: {
                id: user?.id,
              },
            },
            ...(parentId && {
              parent: {
                connect: {
                  id: parentId,
                },
              },
            }),
          },
        });
        return comment;
      } catch (e) {
        console.log(e);

        throw new TRPCError({
          code: "BAD_REQUEST",
        });
      }
    },
  });
