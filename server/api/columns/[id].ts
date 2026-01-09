import { db } from '../../db';
import { column } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const method = event.method;

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Column ID is required',
        });
    }

    if (method === 'PUT') {
        const body = await readBody(event);

        const updated = await db
            .update(column)
            .set({
                name: body.name,
                order: body.order,
            })
            .where(eq(column.id, id))
            .returning();

        return updated[0];
    }

    if (method === 'DELETE') {
        await db.delete(column).where(eq(column.id, id));
        return { success: true };
    }
});
