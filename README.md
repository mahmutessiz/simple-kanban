# Simple Kanban Board

A modern Kanban board application built with **Nuxt 4**, **Drizzle ORM**, **SQLite**, and **better-auth**.

## Features

- 🔐 **Admin-first setup** - First user becomes the admin
- 👥 **User management** - Admins can add and remove users
- 📋 **Boards** - Create multiple boards for different projects
- 📊 **Columns** - Add customizable columns to organize tasks
- ✅ **Tasks** - Create, edit, and delete tasks with descriptions
- 🖱️ **Drag and Drop** - Native HTML5 drag and drop between columns
- 🌙 **Dark Mode** - Beautiful glassmorphism dark theme

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [better-auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js 18+

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd simple-kanban
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Create a `.env` file:
   ```env
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   DB_FILE_NAME=file:local.db
   ```

4. Generate database migrations:
   ```bash
   bunx drizzle-kit generate
   ```

5. Push schema to database:
   ```bash
   bunx drizzle-kit push
   ```

6. Start the development server:
   ```bash
   bun run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) and create your admin account.

## Project Structure

```
simple-kanban/
├── app/
│   ├── assets/css/          # Global styles
│   ├── components/          # Vue components
│   ├── composables/         # Vue composables (useAuth)
│   └── pages/               # App pages
│       ├── index.vue        # Dashboard
│       ├── login.vue        # Login page
│       ├── setup.vue        # Admin setup
│       ├── users.vue        # User management
│       └── boards/[id].vue  # Board view
├── server/
│   ├── api/                 # API routes
│   │   ├── auth/            # Auth endpoints
│   │   ├── boards/          # Board CRUD
│   │   ├── columns/         # Column CRUD
│   │   ├── tasks/           # Task CRUD
│   │   └── users/           # User management
│   ├── db/                  # Database config
│   │   ├── index.ts         # Drizzle connection
│   │   └── schema.ts        # Database schema
│   └── utils/               # Server utilities
│       └── auth.ts          # better-auth config
├── drizzle/                 # Migration files
└── docs/                    # Documentation
```

## Database Schema

| Table | Description |
|-------|-------------|
| `user` | User accounts with roles (admin/user) |
| `session` | Active user sessions |
| `account` | OAuth accounts (if needed) |
| `verification` | Email verification tokens |
| `board` | Kanban boards |
| `column` | Board columns |
| `task` | Tasks within columns |

## Usage

### First Run
1. Navigate to the app - you'll be redirected to `/setup`
2. Create your admin account
3. Login with your credentials

### Creating Boards
1. Click "New Board" on the dashboard
2. Enter a board name
3. Click on the board to open it

### Managing Columns
1. Click "Add Column" on the right side of the board
2. Enter column name (e.g., "To Do", "In Progress", "Done")
3. Delete columns using the trash icon

### Managing Tasks
1. Click "Add Task" at the bottom of any column
2. Enter task title and optional description
3. Drag tasks between columns to update their status
4. Delete tasks using the X button on hover

### User Management (Admin Only)
1. Click "Manage Users" in the header
2. Add new users with the "Add User" button
3. Assign roles (admin or user)
4. Delete users as needed

## Scripts

```bash
# Development
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Generate Drizzle migrations
bunx drizzle-kit generate

# Push schema to database
bunx drizzle-kit push

# Open Drizzle Studio
bunx drizzle-kit studio
```

## License

MIT
