export default defineNuxtRouteMiddleware(async (to) => {
    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/setup'];

    // Check if the current route is public
    if (publicRoutes.includes(to.path)) {
        return;
    }

    // specific check for /api/auth routes to allow them
    if (to.path.startsWith('/api/')) {
        return;
    }

    try {
        const { data: session } = await useFetch('/api/auth/get-session');

        if (!session.value) {
            return navigateTo('/login');
        }
    } catch (error) {
        return navigateTo('/login');
    }
});
