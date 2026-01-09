import { db } from '../../db';
import { board } from '../../db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === 'GET') {
        // List all boards
        const boards = await db.select().from(board).orderBy(board.createdAt);
        return boards;
    }

    if (method === 'POST') {
        // Create a new board
        const body = await readBody(event);

        if (!body.name) {
            throw createError({
                statusCode: 400,
                message: 'Board name is required',
            });
        }

        const newBoard = await db.insert(board).values({
            name: body.name,
            description: body.description || null,
            createdBy: body.userId || 'system', // TODO: Get from session
        }).returning();

        return newBoard[0];
    }
});
