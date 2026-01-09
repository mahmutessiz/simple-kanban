<script setup lang="ts">
const { session, signUp } = useAuth();
const router = useRouter();
const { t, locale, setLocale } = useI18n();

const toggleLanguage = () => {
    setLocale(locale.value === 'en' ? 'tr' : 'en');
};

// Check if user is admin
const isAdmin = computed(() => session.value?.data?.user?.role === 'admin');

// Redirect non-admins
if (!isAdmin.value) {
    await navigateTo('/');
}

// Define interfaces to fix TS excessive stack depth error
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

interface CreateUserResponse {
    success: boolean;
    user: any;
}

// Users state
const users = ref<User[]>([]);
const loading = ref(true);
const showAddModal = ref(false);

const newUser = ref({
    name: '',
    email: '',
    password: '',
    role: 'user',
});

const addingUser = ref(false);
const error = ref('');

// Fetch users
const fetchUsers = async () => {
    loading.value = true;
    try {
        // Explicitly type response to avoid deep inference
        users.value = await $fetch<User[]>('/api/users');
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchUsers();
});

const addUser = async () => {
    if (!newUser.value.email || !newUser.value.password || !newUser.value.name) return;
    
    error.value = '';
    addingUser.value = true;
    
    try {
        await $fetch<CreateUserResponse>('/api/users', {
            method: 'POST',
            body: {
                name: newUser.value.name,
                email: newUser.value.email,
                password: newUser.value.password,
                role: newUser.value.role,
            }
        });
        
        newUser.value = { name: '', email: '', password: '', role: 'user' };
        showAddModal.value = false;
        await fetchUsers();
    } catch (e: any) {
        error.value = e.message || t('auth.errorOccurred');
    } finally {
        addingUser.value = false;
    }
};

const deleteUser = async (userId: string) => {
    if (!confirm(t('users.confirmDeleteUser'))) return;
    
    await $fetch(`/api/users/${userId}`, { method: 'DELETE' });
    await fetchUsers();
};
</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <header class="glass-panel border-b-0 border-b border-dim sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center gap-4">
                    <NuxtLink 
                        to="/"
                        class="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </NuxtLink>
                    <h1 class="text-xl font-bold text-white">{{ t('users.title') }}</h1>
                    
                    <div class="ml-auto flex items-center gap-4">
                        <!-- Language Switcher -->
                        <button 
                            @click="toggleLanguage"
                            class="px-3 py-1.5 rounded-lg bg-surface border border-dim text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase"
                        >
                            {{ locale }}
                        </button>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Main Content -->
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-white">{{ t('users.users') }}</h2>
                <button 
                    @click="showAddModal = true"
                    class="px-4 py-2 btn-primary rounded-xl shadow-lg transition-all"
                >
                    + {{ t('users.addUser') }}
                </button>
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="flex items-center justify-center py-16">
                <svg class="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
            </div>
            
            <!-- Users List -->
            <div v-else class="space-y-4">
                <div 
                    v-for="user in users" 
                    :key="user.id"
                    class="glass-panel bg-surface rounded-xl p-4 flex items-center justify-between hover:bg-surface-hover transition-colors"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-surface-active border border-dim flex items-center justify-center">
                            <span class="text-white font-semibold">
                                {{ user.name?.charAt(0)?.toUpperCase() || 'U' }}
                            </span>
                        </div>
                        <div>
                            <h3 class="font-medium text-white">{{ user.name }}</h3>
                            <p class="text-sm text-slate-400">{{ user.email }}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-4">
                        <span 
                            class="px-3 py-1 rounded-full text-xs font-medium"
                            :class="user.role === 'admin' ? 'bg-primary text-black' : 'bg-surface-active text-slate-300 border border-dim'"
                        >
                            {{ user.role === 'admin' ? t('users.admin') : t('users.user') }}
                        </span>
                        <button 
                            v-if="user.id !== session?.data?.user?.id"
                            @click="deleteUser(user.id)"
                            class="p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <p v-if="!users.length" class="text-center text-slate-400 py-8">
                    {{ t('users.noUsers') }}
                </p>
            </div>
        </main>
        
        <!-- Add User Modal -->
        <Teleport to="body">
            <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddModal = false"></div>
                <div class="relative glass-panel bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">{{ t('users.addNewUser') }}</h3>
                    
                    <div v-if="error" class="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                        {{ error }}
                    </div>
                    
                    <form @submit.prevent="addUser" class="space-y-4">
                        <input 
                            v-model="newUser.name"
                            type="text"
                            :placeholder="t('users.fullName')"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20"
                        />
                        <input 
                            v-model="newUser.email"
                            type="email"
                            placeholder="Email"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20"
                        />
                        <input 
                            v-model="newUser.password"
                            type="password"
                            placeholder="Password"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20"
                        />
                        <select 
                            v-model="newUser.role"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 appearance-none"
                        >
                            <option value="user" class="text-black">{{ t('users.user') }}</option>
                            <option value="admin" class="text-black">{{ t('users.admin') }}</option>
                        </select>
                        <div class="flex gap-3">
                            <button 
                                type="button"
                                @click="showAddModal = false"
                                class="flex-1 px-4 py-3 btn-secondary rounded-xl transition-all"
                            >
                                {{ t('common.cancel') }}
                            </button>
                            <button 
                                type="submit"
                                :disabled="addingUser"
                                class="flex-1 px-4 py-3 btn-primary rounded-xl transition-all disabled:opacity-50"
                            >
                                {{ addingUser ? t('users.adding') : t('users.addUser') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>
