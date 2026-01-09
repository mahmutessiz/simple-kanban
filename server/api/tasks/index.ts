import { db } from '../../db';
import { task } from '../../db/schema';
import { eq, max } from 'drizzle-orm';
import { auth } from '../../utils/auth';
import sharp from 'sharp';

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === 'POST') {
        const session = await auth.api.getSession({ headers: event.headers });
        const user = session?.user;

        // Use readMultipartFormData to handle file upload
        const formData = await readMultipartFormData(event);
        if (!formData) {
            throw createError({ statusCode: 400, message: 'Invalid form data' });
        }

        const getField = (name: string) => {
            const field = formData.find(f => f.name === name);
            return field ? field.data.toString() : undefined;
        };

        const title = getField('title');
        const columnId = getField('columnId');
        const description = getField('description');
        const file = formData.find(f => f.name === 'image');

        if (!columnId || !title) {
            throw createError({
                statusCode: 400,
                message: 'Column ID and task title are required',
            });
        }

        let imageBase64: string | null = null;
        if (file && file.filename) {
            // Compress and resize image
            const buffer = await sharp(file.data)
                .resize({ width: 800, height: 600, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            imageBase64 = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }

        // Get max order for this column
        const maxOrder = await db
            .select({ max: max(task.order) })
            .from(task)
            .where(eq(task.columnId, columnId));

        const newOrder = (maxOrder[0]?.max ?? -1) + 1;

        const newTask = await db.insert(task).values({
            columnId: columnId,
            title: title,
            description: description || null,
            image: imageBase64,
            creatorId: user ? user.id : null,
            order: newOrder,
        }).returning();

        return newTask[0];
    }
});
