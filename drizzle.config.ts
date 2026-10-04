import type { Config } from "drizzle-kit";
export default {
  schema: "./lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_xafB7sFhULp3@ep-floral-waterfall-azni0zqa-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
} satisfies Config;