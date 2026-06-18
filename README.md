# Parish Website

A complete parish website with React + TypeScript frontend and Node.js + Express backend.

## Project Structure

```
ParishWebsite/
├── backend/          # Node.js + Express API
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── server.js     # Express server
├── frontend/         # React + TypeScript app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.tsx
│   └── vite.config.ts
└── README.md
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB Atlas connection string and JWT secret. Optional: Configure email (SMTP) and WhatsApp (Twilio) services for notifications:
```
PORT=5000
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=your-secret-key
NODE_ENV=development

# Optional: Email Service (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=Parish Website

# Optional: WhatsApp Messaging (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=+1234567890
# Optional fallback voice/SMS number
TWILIO_PHONE_NUMBER=+1234567890
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

## Features

### Public Pages
- **Homepage**: Welcome message, highlights, latest announcements
- **Parish Information**: History, mission, pastoral team
- **Mass Schedule**: Sunday & weekday Mass times, confession, adoration
- **News & Announcements**: Latest updates and events
- **Ministries & Groups**: Information about various ministries
- **Sacraments**: Requirements for baptism, marriage, confirmation, etc.
- **Gallery**: Photos and videos of parish events
- **Contact**: Map, office info, contact form, prayer requests

### Admin Dashboard
- Manage announcements
- Manage events
- Manage mass schedule
- Manage ministries
- Manage gallery
- View prayer requests
- Send email and WhatsApp notifications

## API Endpoints

- `POST /api/auth/login` - Admin login
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement (admin)
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `GET /api/mass-schedule` - Get mass schedule
- `POST /api/mass-schedule` - Create schedule (admin)
- `GET /api/ministries` - Get all ministries
- `POST /api/ministries` - Create ministry (admin)
- `GET /api/gallery` - Get gallery items
- `POST /api/gallery` - Create gallery item (admin)
- `POST /api/prayer-requests` - Submit prayer request
- `GET /api/prayer-requests` - Get all requests (admin)
- `GET /api/notifications/status` - Get notification service status (admin)
- `GET /api/notifications/history` - Get notification history (admin)
- `POST /api/notifications/send` - Send notification via email/WhatsApp (admin)
- `POST /api/notifications/send-bulk` - Send bulk notifications (admin)

## MongoDB Models

- **User**: Admin users
- **Announcement**: Parish announcements
- **Event**: Parish events
- **MassSchedule**: Mass and service schedules
- **Ministry**: Parish ministries
- **GalleryItem**: Gallery photos/videos
- **PrayerRequest**: Prayer requests from visitors
- **Notification**: Notification logs for email and WhatsApp

## Creating an Admin User

After setting up the backend and MongoDB connection, create an admin user using the provided script:

```bash
cd backend
npm run create-admin [username] [password]
```

Example:
```bash
npm run create-admin admin mypassword123
```

If no username/password is provided, it defaults to `admin`/`admin123`. **Please change the password after first login!**

## Development

- Backend runs on `http://localhost:5000`
- Frontend runs on `http://localhost:3000`
- Frontend proxies API requests to the backend

## Notification Service

The backend includes a comprehensive notification service that supports both email and WhatsApp (via Twilio) notifications.

### Features
- Send email notifications via SMTP
- Send WhatsApp notifications via Twilio
- Send both email and WhatsApp simultaneously
- Bulk notification support
- Notification history and logging
- Service status monitoring

### Configuration

**Email (SMTP):** Configure SMTP settings in `.env` for email notifications. Works with Gmail, Outlook, SendGrid, and other SMTP providers.

**WhatsApp (Twilio):** Configure Twilio WhatsApp credentials (Account SID, Auth Token, WhatsApp-enabled number) in `.env`. Sign up at https://www.twilio.com.

See `backend/services/README.md` for detailed documentation and usage examples.

## Production Deployment

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Serve the frontend build with a static server or integrate with the backend.

3. Set environment variables in production.

4. Ensure MongoDB Atlas is configured with proper security settings.

5. Configure notification services (SMTP and/or Twilio) for production use.

