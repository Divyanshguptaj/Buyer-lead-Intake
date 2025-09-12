import { db } from '@/db';
import { buyers } from '@/db/schema';
import { count } from 'drizzle-orm';

async function testDbConnection() {
  try {
    console.log('Testing database connection...');
    const result = await db.select({ count: count() }).from(buyers);
    console.log('Database connection successful!');
    console.log(`Total buyers in database: ${result[0].count}`);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export { testDbConnection };
