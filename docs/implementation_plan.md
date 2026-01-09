# Simple Kanban App Implementation Plan

A Kanban board application built with Nuxt 4, Drizzle ORM, SQLite, and better-auth. Features admin-first setup, user management, boards with columns, and native HTML5 drag-and-drop tasks.

## User Review Required

> [!IMPORTANT]
> **First-run admin setup**: The app will check if any users exist on startup. If none, it redirects to `/setup` for creating the first admin account. This admin can then add other users.

> [!NOTE]
> **Authentication Strategy**: Using better-auth with email/password. Admins manage users—no self-registration.

---

## Proposed Changes

### Database & ORM Setup

#### [NEW] [db/index.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/db/index.ts)
Drizzle ORM connection to SQLite database file (`./data/kanban.db`).

#### [NEW] [schema.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/db/schema.ts)
Database tables:
- `user` - better-auth user table (id, name, email, password, role, etc.)
- `session` - better-auth session table
- `account` - better-auth account table
- `verification` - better-auth verification table
- `board` - Kanban boards (id, name, createdBy, createdAt)
- `column` - Board columns (id, boardId, name, order)
- `task` - Tasks (id, columnId, title, description, order, createdAt)

---

### Authentication (better-auth)

#### [NEW] [auth.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/utils/auth.ts)
Better-auth configuration with Drizzle adapter, admin plugin for user management.

#### [NEW] [auth/[...all].ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/auth/[...all].ts)
Catch-all API route for better-auth endpoints.

#### [NEW] [useAuth.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/composables/useAuth.ts)
Client-side auth composable using better-auth's Vue integration.

#### [NEW] [auth.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/middleware/auth.ts)
Server middleware to check authentication on protected API routes.

---

### Pages & UI

#### [NEW] [setup.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/pages/setup.vue)
First-run admin creation screen. Only accessible when no users exist.

#### [NEW] [login.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/pages/login.vue)
Login page with email/password form.

#### [NEW] [index.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/pages/index.vue)
Dashboard showing list of boards. Create new board button.

#### [NEW] [boards/[id].vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/pages/boards/[id].vue)
Single board view with columns and tasks. Native drag-and-drop between columns.

#### [NEW] [users.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/pages/users.vue)
Admin-only user management page. Add/remove users.

#### [MODIFY] [app.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/app.vue)
Add NuxtPage, global layout with navigation.

---

### Components

#### [NEW] [BoardCard.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/components/BoardCard.vue)
Card component for board list display.

#### [NEW] [KanbanColumn.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/components/KanbanColumn.vue)
Column component with task list and drag-drop zone.

#### [NEW] [TaskCard.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/components/TaskCard.vue)
Draggable task card with `draggable="true"` and drag events.

#### [NEW] [CreateBoardModal.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/components/CreateBoardModal.vue)
Modal dialog for creating new boards.

#### [NEW] [CreateTaskModal.vue](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/components/CreateTaskModal.vue)
Modal dialog for creating/editing tasks.

---

### API Routes

#### [NEW] [boards/index.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/boards/index.ts)
GET: List all boards, POST: Create board.

#### [NEW] [boards/[id].ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/boards/[id].ts)
GET: Single board with columns/tasks, PUT: Update, DELETE: Delete board.

#### [NEW] [columns/index.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/columns/index.ts)
POST: Create column for a board.

#### [NEW] [columns/[id].ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/columns/[id].ts)
PUT: Update column, DELETE: Delete column.

#### [NEW] [columns/reorder.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/columns/reorder.ts)
PUT: Reorder columns within a board.

#### [NEW] [tasks/index.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/tasks/index.ts)
POST: Create task in column.

#### [NEW] [tasks/[id].ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/tasks/[id].ts)
PUT: Update task, DELETE: Delete task.

#### [NEW] [tasks/move.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/tasks/move.ts)
PUT: Move task to different column, update order.

#### [NEW] [users/index.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/users/index.ts)
Admin endpoints: GET list users, POST create user.

#### [NEW] [check-setup.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/server/api/check-setup.ts)
GET: Check if any admin user exists (for first-run detection).

---

### Configuration

#### [MODIFY] [nuxt.config.ts](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/nuxt.config.ts)
Add runtime config for auth secret, enable auto-imports.

#### [MODIFY] [package.json](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/package.json)
Add dependencies: `drizzle-orm`, `better-sqlite3`, `better-auth`, `drizzle-kit`.

---

### Styles

#### [NEW] [main.css](file:///c:/Users/MUSTAFA/Desktop/simple-kanban/app/assets/main.css)
Global CSS with modern design system: dark mode, glassmorphism effects, smooth animations.

---

## Verification Plan

### Manual Testing

1. **Run dev server**: `bun run dev`
2. **First-run flow**: Navigate to `http://localhost:3000`, should redirect to `/setup`
3. **Create admin**: Fill form, submit, verify redirect to login
4. **Login**: Login with admin credentials
5. **Create board**: Click "New Board", enter name, verify it appears
6. **Add columns**: Add "To Do", "In Progress", "Done" columns
7. **Create tasks**: Add tasks to columns
8. **Drag-and-drop**: Drag a task from one column to another, verify order persists after refresh
9. **User management**: Navigate to `/users`, add a new user, logout, login as new user

### Database Verification
```bash
# Check SQLite database was created
ls ./data/kanban.db
```
