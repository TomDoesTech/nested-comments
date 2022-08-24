// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { postRouter } from "./post";
import { commentRouter } from "./comment";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge("posts.", postRouter)
  .merge("comments.", commentRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
