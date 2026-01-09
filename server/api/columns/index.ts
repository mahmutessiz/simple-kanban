import { db } from '../../db';
import { column } from '../../db/schema';
import { eq, max } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === 'POST') {
        const body = await readBody(event);

        if (!body.boardId || !body.name) {
            throw createError({
                statusCode: 400,
                message: 'Board ID and column name are required',
            });
        }

        // Get max order for this board
        const maxOrder = await db
            .select({ max: max(column.order) })
            .from(column)
            .where(eq(column.boardId, body.boardId));

        const newOrder = (maxOrder[0]?.max ?? -1) + 1;

        const newColumn = await db.insert(column).values({
            boardId: body.boardId,
            name: body.name,
            order: newOrder,
        }).returning();

        return newColumn[0];
    }
});
