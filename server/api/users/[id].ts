import { db } from '../../db';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const method = event.method;

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'User ID is required',
        });
    }

    if (method === 'DELETE') {
        await db.delete(user).where(eq(user.id, id));
        return { success: true };
    }
});
