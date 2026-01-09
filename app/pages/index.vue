<script setup lang="ts">
const { session, signOut } = useAuth();
const router = useRouter();
const { t, locale, setLocale } = useI18n();

const toggleLanguage = () => {
    setLocale(locale.value === 'en' ? 'tr' : 'en');
};

// Define Board interface locally to fix type inference
interface Board {
    id: string;
    name: string;
    description: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

// Check setup status
const { data: setupStatus } = await useFetch('/api/check-setup');

if (setupStatus.value?.needsSetup) {
    await navigateTo('/setup');
}

// Fetch boards with explicit type
const { data: boards, refresh: refreshBoards } = await useFetch<Board[]>('/api/boards');

const showCreateModal = ref(false);
const newBoardName = ref('');
const creating = ref(false);

const createBoard = async () => {
    if (!newBoardName.value.trim()) return;
    
    creating.value = true;
    try {
        await $fetch('/api/boards', {
            method: 'POST',
            body: {
                name: newBoardName.value,
                userId: session.value?.data?.user?.id,
            },
        });
        newBoardName.value = '';
        showCreateModal.value = false;
        await refreshBoards();
    } finally {
        creating.value = false;
    }
};

const deleteBoard = async (id: string) => {
    if (!confirm(t('dashboard.confirmDeleteBoard'))) return;
    
    await $fetch(`/api/boards/${id}`, { method: 'DELETE' });
    await refreshBoards();
};

const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
};

const isAdmin = computed(() => session.value?.data?.user?.role === 'admin');
</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <header class="glass-panel border-b-0 border-b border-dim sticky top-0 z-40">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-surface border border-dim flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                            </svg>
                        </div>
                        <h1 class="text-xl font-bold text-white">{{ t('dashboard.title') }}</h1>
                    </div>
                    
                    <div class="flex items-center gap-4">
                        <!-- Language Switcher -->
                        <button 
                            @click="toggleLanguage"
                            class="px-3 py-1.5 rounded-lg bg-surface border border-dim text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase"
                        >
                            {{ locale }}
                        </button>

                        <NuxtLink 
                            v-if="isAdmin"
                            to="/users" 
                            class="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                        >
                            {{ t('dashboard.manageUsers') }}
                        </NuxtLink>
                        <span class="text-slate-400 text-sm">{{ session?.data?.user?.email }}</span>
                        <button 
                            @click="handleSignOut"
                            class="px-4 py-2 text-sm btn-secondary rounded-lg transition-all"
                        >
                            {{ t('auth.signOut') }}
                        </button>
                    </div>
                </div>
            </div>
        </header>
        
        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex items-center justify-between mb-8">
                <h2 class="text-2xl font-bold text-white">{{ t('dashboard.yourBoards') }}</h2>
                <button 
                    @click="showCreateModal = true"
                    class="px-4 py-2 btn-primary rounded-xl shadow-lg transition-all"
                >
                    + {{ t('dashboard.newBoard') }}
                </button>
            </div>
            
            <!-- Boards Grid -->
            <div v-if="boards?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NuxtLink 
                    v-for="board in boards" 
                    :key="board.id"
                    :to="`/boards/${board.id}`"
                    class="group relative glass-panel rounded-2xl p-6 hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                >
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-lg font-semibold text-white mb-2 group-hover:text-white transition-colors">
                                {{ board.name }}
                            </h3>
                            <p class="text-slate-400 text-sm">
                                {{ board.description || t('dashboard.noDescription') }}
                            </p>
                        </div>
                        <button 
                            @click.prevent="deleteBoard(board.id)"
                            class="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-lg transition-all"
                        >
                            <svg class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                    <div class="mt-4 pt-4 border-t border-dim">
                        <span class="text-xs text-slate-500">
                            {{ t('dashboard.created') }} {{ new Date(board.createdAt).toLocaleDateString() }}
                        </span>
                    </div>
                </NuxtLink>
            </div>
            
            <!-- Empty State -->
            <div v-else class="text-center py-16">
                <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-surface border border-dim flex items-center justify-center">
                    <svg class="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-white mb-2">{{ t('dashboard.noBoards') }}</h3>
                <p class="text-slate-400 mb-6">{{ t('dashboard.createFirstBoard') }}</p>
                <button 
                    @click="showCreateModal = true"
                    class="px-6 py-3 btn-primary rounded-xl shadow-lg transition-all"
                >
                    {{ t('dashboard.createBoard') }}
                </button>
            </div>
        </main>
        
        <!-- Create Board Modal -->
        <Teleport to="body">
            <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
                <div class="relative glass-panel bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">{{ t('dashboard.createNewBoard') }}</h3>
                    <form @submit.prevent="createBoard">
                        <input 
                            v-model="newBoardName"
                            type="text"
                            :placeholder="t('dashboard.boardName')"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 mb-4"
                            autofocus
                        />
                        <div class="flex gap-3">
                            <button 
                                type="button"
                                @click="showCreateModal = false"
                                class="flex-1 px-4 py-3 btn-secondary rounded-xl transition-all"
                            >
                                {{ t('common.cancel') }}
                            </button>
                            <button 
                                type="submit"
                                :disabled="creating || !newBoardName.trim()"
                                class="flex-1 px-4 py-3 btn-primary rounded-xl transition-all disabled:opacity-50"
                            >
                                {{ creating ? t('dashboard.creating') : t('common.add') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>
