import { db } from '../db';
import { user } from '../db/schema';
import { count } from 'drizzle-orm';

export default defineEventHandler(async () => {
    const [result] = await db.select({ count: count() }).from(user);
    return {
        hasUsers: result.count > 0,
        needsSetup: result.count === 0,
    };
});
