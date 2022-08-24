import { createRouter } from "./context";
import { z } from "zod";
import crypto from "crypto";
import sanitizeHtml from "sanitize-html";
import { TRPCError } from "@trpc/server";

const getPermaLink = (title: string) =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const postRouter = createRouter()
  .query("get-all", {
    async resolve({ ctx }) {
      return ctx.prisma.post.findMany({
        select: {
          id: true,
          title: true,
          permalink: true,
        },
      });
    },
  })
  .query("find-by-permalink", {
    input: z.object({
      permalink: z.string(),
    }),
    async resolve({ ctx, input }) {
      const { permalink } = input;

      const post = await ctx.prisma.post.findUnique({
        where: {
          permalink,
        },
        select: {
          title: true,
          body: true,
          createdAt: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
        });
      }

      return post;
    },
  })
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next();
  })
  .mutation("create-post", {
    input: z.object({
      title: z.string(),
      body: z.string(),
    }),
    resolve({ ctx, input }) {
      const { title, body } = input;

      const permalink = `${getPermaLink(title)}-${crypto
        .randomBytes(2)
        .toString("hex")}`;

      const user = ctx.session?.user;

      return ctx.prisma.post.create({
        data: {
          title,
          body: sanitizeHtml(body, {
            allowedTags: ["b", "i", "em", "strong", "a"],
            allowedAttributes: {
              a: ["href"],
            },
            allowedIframeHostnames: ["www.youtube.com"],
          }),
          permalink,
          user: {
            connect: {
              id: user?.id,
            },
          },
        },
      });
    },
  });
