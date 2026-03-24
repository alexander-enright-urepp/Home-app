# Home - Linktree Clone

A Linktree-style web application built with Next.js 14, Supabase, and Tailwind CSS.

## Features

- 🔐 Email/password authentication with Supabase
- 📝 Customizable public profile pages (`/[username]`)
- 🔗 Drag-and-drop link reordering
- 🎨 Custom link colors and icons
- 📱 Mobile-first responsive design
- 🏃‍♂️ Real-time visibility toggles

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- dnd-kit (drag and drop)
- lucide-react (icons)
- react-hot-toast (notifications)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Project Settings > API
3. Copy the "URL" and "anon/public" key

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

1. In Supabase, go to SQL Editor
2. Open `database-schema.sql` from this project
3. Run the SQL to create tables and RLS policies

### 5. Configure Authentication

1. In Supabase, go to Authentication > Providers
2. Enable "Email" provider
3. Disable "Confirm email" if you want instant signups (optional)

### 6. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Usage

1. **Sign Up**: Create an account and choose a unique username
2. **Dashboard**: Add, edit, and reorder your links
3. **Public Page**: Your profile is live at `http://localhost:3000/[username]`
4. **Preview**: Click "Preview" in the dashboard to see your public page

## Link Features

- **Title**: Required - what shows on the card
- **Subtitle**: Optional - additional context
- **URL**: The link destination
- **Icon**: Lucide icon name (e.g., `twitter`, `github`) or emoji
- **Color**: Background color for the card
- **Visibility**: Toggle to show/hide on your public page

## Icon Options

You can use:
- **Lucide icons**: `twitter`, `github`, `linkedin`, `instagram`, `youtube`, `mail`, `link`, etc.
- **Emojis**: Paste any emoji directly

## Deployment

Ready for Vercel:

```bash
vercel
```

Don't forget to add your environment variables in Vercel's project settings.

## License

MIT
