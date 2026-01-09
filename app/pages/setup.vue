<script setup lang="ts">
const { signUp } = useAuth();
const router = useRouter();
const { t, locale, setLocale } = useI18n();

const toggleLanguage = () => {
    setLocale(locale.value === 'en' ? 'tr' : 'en');
};

const form = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
});

const error = ref('');
const loading = ref(false);

// Check if setup is needed
const { data: setupStatus } = await useFetch('/api/check-setup');

// If users already exist, redirect to login
if (setupStatus.value?.hasUsers) {
    await navigateTo('/login');
}

const handleSubmit = async () => {
    error.value = '';
    
    if (form.value.password !== form.value.confirmPassword) {
        error.value = t('setup.passMismatch');
        return;
    }
    
    if (form.value.password.length < 8) {
        error.value = t('setup.passTooShort');
        return;
    }
    
    loading.value = true;
    
    try {
        // Use dedicated setup endpoint that handles admin role assignment
        await $fetch('/api/setup-admin', {
            method: 'POST',
            body: {
                email: form.value.email,
                password: form.value.password,
                name: form.value.name,
            }
        });
        
        // After setup, automatically login or redirect
        // Since setup-admin creates the user, we just need to redirect to login
        // Or if we want to auto-login, we might need to handle session setting.
        // For simplicity, redirect to login page where they can sign in.
        await navigateTo('/login');
    } catch (e: any) {
        error.value = e.data?.message || e.message || 'An error occurred';
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div class="w-full max-w-md">
            <!-- Logo/Title -->
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-dim mb-4">
                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                    </svg>
                </div>
                <!-- Language Switcher -->
                <div class="mb-4">
                    <button 
                        @click="toggleLanguage"
                        class="px-3 py-1.5 rounded-lg bg-surface border border-dim text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase"
                    >
                        {{ locale }}
                    </button>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">{{ t('setup.title') }}</h1>
                <p class="text-slate-400">{{ t('setup.subtitle') }}</p>
            </div>
            
            <!-- Form Card -->
            <div class="glass-panel rounded-2xl p-8 shadow-2xl">
                <form @submit.prevent="handleSubmit" class="space-y-6">
                    <!-- Error Alert -->
                    <div v-if="error" class="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm">
                        {{ error }}
                    </div>
                    
                    <!-- Name Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ t('setup.fullName') }}</label>
                        <input 
                            v-model="form.name"
                            type="text" 
                            required
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="John Doe"
                        />
                    </div>
                    
                    <!-- Email Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ t('common.email') }}</label>
                        <input 
                            v-model="form.email"
                            type="email" 
                            required
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="admin@example.com"
                        />
                    </div>
                    
                    <!-- Password Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ t('common.password') }}</label>
                        <input 
                            v-model="form.password"
                            type="password" 
                            required
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                    
                    <!-- Confirm Password Field -->
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ t('setup.confirmPassword') }}</label>
                        <input 
                            v-model="form.confirmPassword"
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
                            {{ t('setup.creatingAccount') }}
                        </span>
                        <span v-else>{{ t('setup.createAdmin') }}</span>
                    </button>
                </form>
            </div>
            
            <!-- Footer -->
            <p class="text-center text-slate-500 text-sm mt-6">
                {{ t('setup.footer') }}
            </p>
        </div>
    </div>
</template>
