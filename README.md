# ProtectMyMobile 📱🇬🇧

**ProtectMyMobile** is a comprehensive resource for mobile phone theft prevention, statistics, and recovery in the UK. It features real-time data visualization, community-driven analytics, and actionable advice to help users protect their devices.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-live-green.svg)

## 🚀 Tech Stack

- **Framework:** [Astro](https://astro.build) (SSR mode)
- **UI Library:** [React](https://react.dev) (for interactive islands)
- **Styling:** [Tailwind CSS](https://tailwindcss.com)
- **Database:** [Supabase](https://supabase.com) (PostgreSQL)
- **Maps:** [Leaflet](https://leafletjs.com) / [React-Leaflet](https://react-leaflet.js.org)
- **Charts:** [Recharts](https://recharts.org)
- **Hosting:** [Netlify](https://netlify.com)
- **Icons:** [Lucide React](https://lucide.dev)
- **Analytics:** [Umami](https://umami.is) (Self-hosted)

## ✨ Key Features

### 📊 UK Theft Statistics
- Interactive dashboard showing national and regional theft data.
- Real-time city toggles (UK, London, Manchester, Birmingham).
- Breakdown of theft hotspots, time-of-day risks, and recovery rates.
- **Source:** Met Police, ONS, and Home Office data.

### 🗺️ Interactive Timelapse Map
- **UK-First View:** Visualizes theft density across major UK cities.
- **London Drill-down:** Detailed choropleth map of London boroughs.
- **Seasonal Trends:** Animated timeline showing how theft patterns change throughout the year.
- **Privacy-Focused:** Aggregated data only; no individual addresses exposed.

### 🗳️ Community Analytics
- Anonymous voting system for users to share their theft experiences.
- Real-time insights on recovery rates, police reporting, and security measures.
- IP-based hashing for spam prevention without tracking personal data.

### 🛡️ Prevention & Recovery Resources
- **Security Checkup:** Interactive tool to assess device safety.
- **Emergency Guide:** Step-by-step actions to take immediately after theft.
- **Bank & Provider Contacts:** Quick access to essential contact numbers.

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/antonio59/ProtectMyMobile.git
   cd ProtectMyMobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_key_optional
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:4321`

## 📂 Project Structure

```
/
├── public/                  # Static assets (images, geojson)
├── src/
│   ├── components/          # UI Components (React & Astro)
│   │   ├── TimelapseMapFinal.tsx  # Main map component
│   │   ├── UKStatistics.tsx       # Stats dashboard
│   │   └── ...
│   ├── data/                # Static data files
│   ├── layouts/             # Astro layouts
│   ├── lib/                 # Utilities & Supabase client
│   ├── pages/               # File-based routing
│   │   ├── api/             # Server-side API endpoints
│   │   ├── statistics.astro # Stats page
│   │   ├── timelapse.astro  # Map page
│   │   └── ...
│   └── styles/              # Global CSS
├── supabase-schema.sql      # Database definitions
└── package.json
```

## 🚢 Deployment

The project is configured for deployment on **Netlify**.

1. Connect your GitHub repository to Netlify.
2. Set the build command: `npm run build`.
3. Set the publish directory: `dist`.
4. Add your Environment Variables in the Netlify dashboard.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📄 License

This project is licensed under the MIT License.
