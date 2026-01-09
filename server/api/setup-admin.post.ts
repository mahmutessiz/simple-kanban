import { db } from '../db';
import { user } from '../db/schema';
import { count, eq } from 'drizzle-orm';
import { auth } from '../utils/auth';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.email || !body.password || !body.name) {
        throw createError({
            statusCode: 400,
            message: 'Missing required fields',
        });
    }

    // 1. Check if any users exist
    const [result] = await db.select({ count: count() }).from(user);

    if (result.count > 0) {
        throw createError({
            statusCode: 403,
            message: 'Setup has already been completed',
        });
    }

    // 2. Create the user using better-auth API
    // We utilize the signUpEmail method exposed by better-auth
    try {
        const response = await auth.api.signUpEmail({
            body: {
                email: body.email,
                password: body.password,
                name: body.name,
            }
        });

        // 3. Update the user to have 'admin' role
        if (response && response.user) {
            await db.update(user)
                .set({ role: 'admin' })
                .where(eq(user.id, response.user.id));

            return {
                user: {
                    ...response.user,
                    role: 'admin'
                }
            };
        }
    } catch (error: any) {
        throw createError({
            statusCode: 500,
            message: error.message || 'Failed to create admin user',
        });
    }
});
