import { db } from '../../db';
import { task } from '../../db/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';

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
        const order = getField('order');
        const file = formData.find(f => f.name === 'image');
        const imageAction = getField('imageAction'); // 'keep', 'update', 'remove'

        let imageUpdate: { image?: string | null } = {};

        if (imageAction === 'remove') {
            imageUpdate.image = null;
        } else if (file && file.filename) {
            const buffer = await sharp(file.data)
                .resize({ width: 800, height: 600, fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();

            imageUpdate.image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
        }

        const updated = await db
            .update(task)
            .set({
                title: title,
                description: description,
                columnId: columnId,
                order: order ? parseInt(order) : undefined,
                updatedAt: new Date(),
                ...imageUpdate
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
