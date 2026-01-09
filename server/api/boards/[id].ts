import { db } from '../../db';
import { board, column, task, user } from '../../db/schema';
import { eq, asc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const method = event.method;

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Board ID is required',
        });
    }

    if (method === 'GET') {
        // Get board with columns and tasks
        const boardData = await db.select().from(board).where(eq(board.id, id)).limit(1);

        if (!boardData.length) {
            throw createError({
                statusCode: 404,
                message: 'Board not found',
            });
        }

        // Get columns for this board
        const columns = await db
            .select()
            .from(column)
            .where(eq(column.boardId, id))
            .orderBy(asc(column.order));

        // Get tasks for each column
        const columnsWithTasks = await Promise.all(
            columns.map(async (col) => {
                const tasks = await db
                    .select({
                        id: task.id,
                        columnId: task.columnId,
                        creatorId: task.creatorId,
                        title: task.title,
                        description: task.description,
                        image: task.image,
                        order: task.order,
                        createdAt: task.createdAt,
                        updatedAt: task.updatedAt,
                        creatorName: user.name,
                    })
                    .from(task)
                    .leftJoin(user, eq(task.creatorId, user.id))
                    .where(eq(task.columnId, col.id))
                    .orderBy(asc(task.order));
                return { ...col, tasks };
            })
        );

        return {
            ...boardData[0],
            columns: columnsWithTasks,
        };
    }

    if (method === 'PUT') {
        // Update board
        const body = await readBody(event);

        const updated = await db
            .update(board)
            .set({
                name: body.name,
                description: body.description,
                updatedAt: new Date(),
            })
            .where(eq(board.id, id))
            .returning();

        return updated[0];
    }

    if (method === 'DELETE') {
        // Delete board (cascades to columns and tasks)
        await db.delete(board).where(eq(board.id, id));
        return { success: true };
    }
});
