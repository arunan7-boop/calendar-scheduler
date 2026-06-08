# Calendar Scheduler

AI-powered calendar scheduling system for appointment-based businesses (spas, psychotherapy, etc.).

## Features

- Smart slot-finding with Claude AI
- Google Calendar integration
- Professional & Client dashboards
- Calendar views (daily, weekly, monthly)
- Automated reminders
- Whitelabel-ready theming

## Setup

### Backend

```bash
cd backend
npm install
export DATABASE_URL="postgresql://user:pass@localhost:5432/calendar_scheduler"
npm run migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
calendar-scheduler/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── db/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── styles/
│   └── package.json
└── README.md
