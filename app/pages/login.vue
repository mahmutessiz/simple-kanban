<script setup lang="ts">
const { signIn, session } = useAuth();
const router = useRouter();

const form = ref({
    email: '',
    password: '',
});

const error = ref('');
const loading = ref(false);

// Check if setup is needed first
const { data: setupStatus } = await useFetch('/api/check-setup');

// If no users exist, redirect to setup
if (setupStatus.value?.needsSetup) {
    await navigateTo('/setup');
}

// If already logged in, redirect to dashboard
if (session.value?.data?.user) {
    await navigateTo('/');
}

const handleSubmit = async () => {
    error.value = '';
    loading.value = true;
    
    try {
        const result = await signIn(form.value.email, form.value.password);
        
        if (result.error) {
            error.value = result.error.message || 'Invalid email or password';
        } else {
            await navigateTo('/');
        }
    } catch (e: any) {
        error.value = e.message || 'An error occurred';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md glass-panel py-4">
            <!-- Logo/Title -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-dim mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p class="text-slate-400">Sign in to your Kanban board</p>
            </div>
            
            <!-- Form Card -->
            <div class="rounded-2xl p-8 shadow-2xl">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Error Alert -->
                    <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                        {{ error }}
                    </div>
                    
                    <!-- Email Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <input 
                            v-model="form.email"
                            type="email" 
                            required
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input 
                            v-model="form.password"
                            type="password" 
                            required
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <!-- Submit Button -->
                    <button 
                        type="submit"
                        :disabled="loading"
                        class="w-full py-3 px-4 btn-primary rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="loading" class="flex items-center justify-center gap-2">
                            <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Signing in...
                        </span>
                        <span v-else>Sign In</span>
                    </button>
                </form>
            </div>
        </div>
    </div>
</template>
