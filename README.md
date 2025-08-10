# Focus - Todo, Notes & Blogs

A minimalist productivity application built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### ✅ Tasks
- Create, edit, and delete tasks
- Mark tasks as complete/incomplete
- Filter tasks by status (All, Active, Completed)
- Clean, modern checkbox interface

### 📝 Notes
- Rich text editor with formatting tools
- Auto-save functionality
- Sidebar with note history
- Print functionality
- Keyboard shortcuts for formatting (Ctrl+B, I, U)

### 📖 Blogs
- Full-featured blog editor
- Rich text formatting with toolbar
- Preview mode
- Export to Markdown
- Publish preview in new window
- Word count and reading time estimation
- Auto-save with change tracking

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Storage**: Local Storage with custom hooks

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Key Design Principles

- **Minimalist**: Clean, distraction-free interface
- **Modern**: Uses latest Next.js 15 features and React patterns
- **Accessible**: Built with Radix UI for keyboard navigation and screen readers
- **Responsive**: Works seamlessly on desktop and mobile
- **Fast**: Client-side storage with optimistic updates
- **Consistent**: Uniform design system using shadcn/ui

## Project Structure

```
├── app/                  # Next.js app directory
│   ├── globals.css      # Global styles with shadcn/ui variables
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main application page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── tasks-view.tsx   # Task management component
│   ├── notes-view.tsx   # Note-taking component
│   └── blogs-view.tsx   # Blog writing component
├── hooks/
│   └── use-local-storage.ts  # Local storage hook
├── lib/
│   └── utils.ts         # Utility functions
└── types/
    └── index.ts         # TypeScript type definitions
```

## Keyboard Shortcuts

### Notes & Blogs
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic  
- `Ctrl/Cmd + U` - Underline
- `Ctrl/Cmd + S` - Save (Notes only)
- `Escape` - Exit editing mode

### Tasks
- `Enter` - Add new task or confirm edit
- `Escape` - Cancel editing
- `Double-click` - Edit task

## Storage

All data is stored locally in your browser using localStorage. Your data persists across browser sessions but is tied to the specific browser and domain.

## Contributing

This application was migrated from a Vite + React setup to Next.js 15 with modern tooling and shadcn/ui components for better developer experience and user interface.