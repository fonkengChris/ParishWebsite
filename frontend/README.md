# Parish Website - Frontend

React + TypeScript + Tailwind CSS frontend for the Parish Website.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and proxy API requests to `http://localhost:5000`.

## Build

To build for production:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Features

- **Homepage**: Welcome message, parish highlights, latest announcements
- **Parish Information**: History, mission, pastoral team
- **Mass Schedule**: Sunday & weekday Mass times, confession and adoration schedule
- **News & Announcements**: Latest updates and parish events
- **Ministries & Groups**: Information about various ministries
- **Sacraments**: Requirements for baptism, marriage, confirmation, etc.
- **Gallery**: Photos and videos of parish events
- **Contact**: Map, office contact info, online contact form
- **Prayer Request**: Submit prayer requests
- **Admin Dashboard**: Manage announcements, events, gallery, schedule (requires authentication)

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- React Router
- Axios
- Vite

