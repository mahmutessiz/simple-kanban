<script setup lang="ts">
const route = useRoute();
const boardId = route.params.id as string;

// Define interfaces for type safety
interface Task {
    id: string;
    title: string;
    description: string | null;
    columnId: string;
    order: number;
}

interface Column {
    id: string;
    name: string;
    tasks: Task[];
}

interface BoardDetail {
    id: string;
    name: string;
    columns: Column[];
}

// Fetch board data with explicit type
const { data: board, refresh: refreshBoard } = await useFetch<BoardDetail>(`/api/boards/${boardId}`);

// State for modals
const showAddColumnModal = ref(false);
const showAddTaskModal = ref(false);
const activeColumnId = ref<string | null>(null);
const newColumnName = ref('');
const newTaskTitle = ref('');
const newTaskDescription = ref('');

// Drag state
const draggedTask = ref<any>(null);
const dragOverColumnId = ref<string | null>(null);

// Column operations
const addColumn = async () => {
    if (!newColumnName.value.trim()) return;
    
    await $fetch('/api/columns', {
        method: 'POST',
        body: {
            boardId,
            name: newColumnName.value,
        },
    });
    
    newColumnName.value = '';
    showAddColumnModal.value = false;
    await refreshBoard();
};

const deleteColumn = async (columnId: string) => {
    if (!confirm('Delete this column and all its tasks?')) return;
    
    await $fetch(`/api/columns/${columnId}`, { method: 'DELETE' });
    await refreshBoard();
};

// Task operations
const addTask = async () => {
    if (!newTaskTitle.value.trim() || !activeColumnId.value) return;
    
    await $fetch('/api/tasks', {
        method: 'POST',
        body: {
            columnId: activeColumnId.value,
            title: newTaskTitle.value,
            description: newTaskDescription.value,
        },
    });
    
    newTaskTitle.value = '';
    newTaskDescription.value = '';
    showAddTaskModal.value = false;
    activeColumnId.value = null;
    await refreshBoard();
};

const deleteTask = async (taskId: string) => {
    await $fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
    await refreshBoard();
};

const openAddTaskModal = (columnId: string) => {
    activeColumnId.value = columnId;
    showAddTaskModal.value = true;
};

// Native HTML5 Drag and Drop
const handleDragStart = (e: DragEvent, task: any) => {
    draggedTask.value = task;
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
    }
    // Add a small delay to let the drag image render
    setTimeout(() => {
        (e.target as HTMLElement).classList.add('opacity-50');
    }, 0);
};

const handleDragEnd = (e: DragEvent) => {
    (e.target as HTMLElement).classList.remove('opacity-50');
    draggedTask.value = null;
    dragOverColumnId.value = null;
};

const handleDragOver = (e: DragEvent, columnId: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
    }
    dragOverColumnId.value = columnId;
};

const handleDragLeave = (e: DragEvent) => {
    // Only reset if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('[data-column]')) {
        dragOverColumnId.value = null;
    }
};

const handleDrop = async (e: DragEvent, targetColumnId: string) => {
    e.preventDefault();
    dragOverColumnId.value = null;
    
    if (!draggedTask.value || draggedTask.value.columnId === targetColumnId) {
        return;
    }
    
    // Get tasks in target column for ordering
    const targetColumn = board.value?.columns?.find((c: any) => c.id === targetColumnId);
    const newOrder = targetColumn?.tasks?.length || 0;
    
    // Update task's column and order
    await $fetch(`/api/tasks/${draggedTask.value.id}`, {
        method: 'PUT',
        body: {
            ...draggedTask.value,
            columnId: targetColumnId,
            order: newOrder,
        },
    });
    
    draggedTask.value = null;
    await refreshBoard();
};
</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <header class="glass-panel border-b-0 border-b border-dim sticky top-0 z-40">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center gap-4">
                    <NuxtLink 
                        to="/"
                        class="p-2 hover:bg-white/10 rounded-lg transition-all"
                    >
                        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                        </svg>
                    </NuxtLink>
                    <div class="w-10 h-10 rounded-xl bg-surface border border-dim flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"/>
                        </svg>
                    </div>
                    <h1 class="text-xl font-bold text-white">{{ board?.name }}</h1>
                </div>
            </div>
        </header>
        
        <!-- Board Content -->
        <main class="p-4 sm:p-6 lg:p-8 overflow-x-auto">
            <div class="flex gap-6 min-h-[calc(100vh-12rem)]">
                <!-- Columns -->
                <div 
                    v-for="column in board?.columns" 
                    :key="column.id"
                    :data-column="column.id"
                    class="flex-shrink-0 w-80"
                    @dragover="handleDragOver($event, column.id)"
                    @dragleave="handleDragLeave"
                    @drop="handleDrop($event, column.id)"
                >
                    <div 
                        class="glass-panel bg-surface rounded-2xl p-4 transition-all duration-200"
                        :class="dragOverColumnId === column.id ? 'border-primary ring-1 ring-primary bg-surface-hover' : 'border-dim'"
                    >
                        <!-- Column Header -->
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center gap-2">
                                <h3 class="font-semibold text-white">{{ column.name }}</h3>
                                <span class="px-2 py-0.5 bg-white/10 rounded-full text-xs text-slate-400">
                                    {{ column.tasks?.length || 0 }}
                                </span>
                            </div>
                            <button 
                                @click="deleteColumn(column.id)"
                                class="p-1.5 hover:bg-red-500/20 rounded-lg transition-all group"
                            >
                                <svg class="w-4 h-4 text-slate-500 group-hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                        
                        <!-- Tasks -->
                        <div class="space-y-3 min-h-[100px]">
                            <div 
                                v-for="task in column.tasks" 
                                :key="task.id"
                                draggable="true"
                                @dragstart="handleDragStart($event, task)"
                                @dragend="handleDragEnd"
                                class="group bg-surface-active border border-dim rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-text-muted hover:bg-surface-hover transition-all duration-200"
                            >
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1">
                                        <h4 class="font-medium text-white text-sm">{{ task.title }}</h4>
                                        <p v-if="task.description" class="text-slate-400 text-xs mt-1 line-clamp-2">
                                            {{ task.description }}
                                        </p>
                                    </div>
                                    <button 
                                        @click="deleteTask(task.id)"
                                        class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                                    >
                                        <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Add Task Button -->
                        <button 
                            @click="openAddTaskModal(column.id)"
                            class="w-full mt-4 py-2 px-4 border border-dashed border-dim hover:border-text-muted text-slate-400 hover:text-white rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                            </svg>
                            Add Task
                        </button>
                    </div>
                </div>
                
                <!-- Add Column Button -->
                <div class="flex-shrink-0 w-80">
                    <button 
                        @click="showAddColumnModal = true"
                        class="w-full h-32 border-2 border-dashed border-dim hover:border-text-muted rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-all"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                        </svg>
                        Add Column
                    </button>
                </div>
            </div>
        </main>
        
        <!-- Add Column Modal -->
        <Teleport to="body">
            <div v-if="showAddColumnModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddColumnModal = false"></div>
                <div class="relative glass-panel bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">Add Column</h3>
                    <form @submit.prevent="addColumn">
                        <input 
                            v-model="newColumnName"
                            type="text"
                            placeholder="Column name (e.g., To Do, In Progress)"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 mb-4"
                            autofocus
                        />
                        <div class="flex gap-3">
                            <button 
                                type="button"
                                @click="showAddColumnModal = false"
                                class="flex-1 px-4 py-3 btn-secondary rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                :disabled="!newColumnName.trim()"
                                class="flex-1 px-4 py-3 btn-primary rounded-xl transition-all disabled:opacity-50"
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
        
        <!-- Add Task Modal -->
        <Teleport to="body">
            <div v-if="showAddTaskModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showAddTaskModal = false"></div>
                <div class="relative glass-panel bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl">
                    <h3 class="text-xl font-bold text-white mb-4">Add Task</h3>
                    <form @submit.prevent="addTask">
                        <input 
                            v-model="newTaskTitle"
                            type="text"
                            placeholder="Task title"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 mb-4"
                            autofocus
                        />
                        <textarea 
                            v-model="newTaskDescription"
                            placeholder="Description (optional)"
                            rows="3"
                            class="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-white/20 mb-4 resize-none"
                        ></textarea>
                        <div class="flex gap-3">
                            <button 
                                type="button"
                                @click="showAddTaskModal = false"
                                class="flex-1 px-4 py-3 btn-secondary rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                :disabled="!newTaskTitle.trim()"
                                class="flex-1 px-4 py-3 btn-primary rounded-xl transition-all disabled:opacity-50"
                            >
                                Add Task
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
