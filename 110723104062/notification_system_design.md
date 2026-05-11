# Notification System Design

## Overview
The Notification Priority System provides a clean, modern interface for managing and prioritizing notifications with intelligent ranking based on type and recency.

---

## Features & Screenshots

### 1. All Notifications View
Displays all notifications with filtering options by type (Event, Placement, Result) and pagination support.

**All Notifications - Mixed Types:**
![All Notifications - Mixed Types](./output/output_1.png)

**All Notifications - Placement Filter:**
![All Notifications - Placement Filter](./output/output_2.png)

#### Key Features:
- **Filter by Type**: Event, Placement, and Result notification types
- **Pagination**: Customizable items per page (10-100)
- **Color-coded Borders**: 
  - Green: Result type
  - Orange: Event type
  - Blue: Placement type
- **Responsive Design**: Mobile-friendly layout
- **Notification Details**: Shows title and timestamp for each notification

---

### 2. Priority Inbox
Displays top-ranked notifications based on priority scoring algorithm, ordered from highest to lowest importance.

**Priority Inbox - Ranked Notifications:**
![Priority Inbox - Ranked Notifications](./output/output_3.png)

#### Key Features:
- **Ranked Display**: Numbered list (1-10) showing importance order
- **Priority Scores**: Visual display of priority scores (0.00 - 1.00)
- **Smart Ranking**: 
  - 60% weight based on notification type (Placement=3, Result=2, Event=1)
  - 40% weight based on recency
- **Top N Selector**: Adjustable number of top notifications to display
- **Refresh Button**: Manual refresh of priority ranking

---

## Notification Type Weights

| Type | Weight | Description |
|------|--------|-------------|
| **Placement** | 3 | Highest priority - Job/career placements |
| **Result** | 2 | Medium priority - Results and outcomes |
| **Event** | 1 | Lower priority - General events |

---

## Priority Scoring Algorithm

```
Score = (0.60 × Type_Weight) + (0.40 × Recency_Score)

Where:
- Type_Weight: 3 for Placement, 2 for Result, 1 for Event
- Recency_Score: Normalized based on timestamp (newer = higher)
```

---

## Technical Stack

- **Frontend**: React 19 + Material UI v5
- **Backend**: Node.js with Express v4.18.2
- **API Middleware**: Custom Express server (localhost:5000)
- **External API**: Notification service integration
- **Caching**: 5-minute TTL on backend for optimized performance

---

## Getting Started

### Backend
```bash
cd notification_app_be
npm install
npm run server  # Runs on localhost:5000
```

### Frontend
```bash
cd notification_app_fe
npm install
npm start  # Runs on localhost:3000
```

Both servers need to be running for the full application to function!!.
