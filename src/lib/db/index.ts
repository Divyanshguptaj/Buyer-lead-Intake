import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/lib/env';
import * as schema from './schema';

neonConfig.fetchConnectionCache = true;

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export type BuyerType = typeof schema.buyers.$inferSelect;
export type NewBuyerType = typeof schema.buyers.$inferInsert;
