# ProtectMyMobile Frontend

Astro-powered frontend for ProtectMyMobile - UK Mobile Security & Theft Prevention Resource.

## Tech Stack

- **Astro** - Static site generator with minimal JavaScript
- **React** - Used as islands for interactive components
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Features

- SEO-optimized static pages
- Fast page loads with minimal JavaScript
- Interactive components (Security Checkup, Contact Forms, Admin)
- Mobile-first responsive design

## Environment Variables

Create a `.env` file:

```
PUBLIC_API_URL=https://your-railway-backend.railway.app
```

## Development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`

## Deployment

### Cloudflare Pages

1. Push to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Add environment variable: `PUBLIC_API_URL`
5. Deploy!

## Project Structure

```
/
├── public/          # Static assets
├── src/
│   ├── components/  # React islands & Astro components
│   ├── data/        # Static data (banks, providers, etc.)
│   ├── layouts/     # Page layouts
│   ├── lib/         # Utilities
│   ├── pages/       # Routes (file-based routing)
│   └── styles/      # Global styles
└── package.json
```
