# Simple Kanban Board

A professional, self-hosted Kanban board application built with **Nuxt 4**, **Drizzle ORM**, **SQLite**, and **better-auth**. Designed for efficiency with a sleek, monochromatic dark theme.

## Features

- 🔐 **Secure Authentication** - Email/password login with automatic admin assignment
- 👥 **User Management** - Admin interface to manage team members and roles
- 📋 **Project Boards** - Create and manage multiple Kanban boards
- 📊 **Dynamic Columns** - Customizable workflow columns (e.g., Todo, In Progress, Done)
- ✅ **Task Tracking** - Detailed task management with drag-and-drop organization
- 🖱️ **Smooth Interactions** - Native HTML5 drag and drop with fluid animations
- 🌙 **Professional UI** - Monochromatic dark theme utilizing modern HSL color system

## Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com/)
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [better-auth](https://www.better-auth.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime**: Node.js 20+

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mahmutessiz/simple-kanban.git
   cd simple-kanban
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```env
   BETTER_AUTH_SECRET=your-secret-key-here
   BETTER_AUTH_URL=http://localhost:3000
   DB_FILE_NAME=file:local.db
   ```

4. Generate database migrations:
   ```bash
   npx drizzle-kit generate
   ```

5. Push schema to database:
   ```bash
   npx drizzle-kit push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) and create your admin account.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BETTER_AUTH_SECRET` | Secret key for session encryption | `random-string` |
| `BETTER_AUTH_URL` | Base URL of your application | `http://localhost:3000` |
| `DB_FILE_NAME` | SQLite connection string | `file:local.db` or `file:/app/data/kanban.db` |
| `NITRO_HOST` | Host to listen on (required for Docker) | `0.0.0.0` |
| `PORT` | Port to listen on | `3000` |

## Deployment

### Using Docker Compose (Recommended)

This project includes a `Dockerfile` and `docker-compose.yml` for easy deployment with persistent storage.

1. Fork this repository.
2. In your deployment platform (e.g., **Dokploy**, **Coolify**, or a VPS):
   - Choose **Docker Compose** as the deployment method.
   - Set up a **Persistent Volume** for the database.
   - Mount host path to `/app/data` in the container.
3. Configure your Environment Variables in your hosting dashboard.
4. Deploy.

**Important**: Ensure `DB_FILE_NAME` is set to `file:/app/data/kanban.db` in production to use the persistent volume.

### Manual Deployment

```bash
# Build the application
npm run build

# Start the built server
node .output/server/index.mjs
```

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
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
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
2. Create your admin account (first user is always admin)
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
3. Drag tasks between columns to update their status (Note: Image attachment does not hinder drag/drop)
4. Delete tasks using the X button on hover

### User Management (Admin Only)
1. Click "Manage Users" in the header
2. Add new users with the "Add User" button
3. Assign roles (admin or user)
4. Delete users as needed

## Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Database management
npx drizzle-kit push
npx drizzle-kit studio
```

## License

MIT
