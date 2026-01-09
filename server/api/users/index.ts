import { db } from '../../db';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
    const method = event.method;

    if (method === 'GET') {
        // List all users
        const users = await db.select({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
        }).from(user);

        return users;
    }

    if (method === 'POST') {
        const body = await readBody(event);
        const { name, email, password, role } = body;

        if (!email || !password || !name) {
            throw createError({
                statusCode: 400,
                message: 'Missing required fields',
            });
        }

        try {
            // Create user using better-auth api
            const res = await auth.api.signUpEmail({
                body: {
                    email,
                    password,
                    name,
                }
            });

            if (res?.user && role && role !== 'user') {
                // Update role if specific role requested
                await db.update(user)
                    .set({ role })
                    .where(eq(user.id, res.user.id));
            }

            return { success: true, user: res?.user };
        } catch (e: any) {
            throw createError({
                statusCode: 400,
                message: e.message || 'Failed to create user',
            });
        }
    }
});
