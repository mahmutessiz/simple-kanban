import { db } from '../../db';
import { task } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const method = event.method;

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Task ID is required',
        });
    }

    if (method === 'PUT') {
        const body = await readBody(event);

        const updated = await db
            .update(task)
            .set({
                title: body.title,
                description: body.description,
                columnId: body.columnId,
                order: body.order,
                updatedAt: new Date(),
            })
            .where(eq(task.id, id))
            .returning();

        return updated[0];
    }

    if (method === 'DELETE') {
        await db.delete(task).where(eq(task.id, id));
        return { success: true };
    }
});
