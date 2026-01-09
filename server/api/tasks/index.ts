import { db } from '../../db';
import { task } from '../../db/schema';
import { eq, max } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === 'POST') {
        const body = await readBody(event);

        if (!body.columnId || !body.title) {
            throw createError({
                statusCode: 400,
                message: 'Column ID and task title are required',
            });
        }

        // Get max order for this column
        const maxOrder = await db
            .select({ max: max(task.order) })
            .from(task)
            .where(eq(task.columnId, body.columnId));

        const newOrder = (maxOrder[0]?.max ?? -1) + 1;

        const newTask = await db.insert(task).values({
            columnId: body.columnId,
            title: body.title,
            description: body.description || null,
            order: newOrder,
        }).returning();

        return newTask[0];
    }
});
