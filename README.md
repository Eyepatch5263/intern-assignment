# PharmaDash: Pharmacy Management System

A modern, high-performance pharmacy management dashboard for tracking sales, inventory, and purchase orders.

## 🚀 Tech Stack
- **Frontend**: React (Vite) + Vanilla CSS
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: CockroachDB (Cloud)
- **Timezone Support**: Integrated IST conversion for sales accuracy.

## ✨ Core Features
- **Smart Dashboard**: Real-time revenue tracking (Today/Monthly) and lifetime sales stats.
- **Advanced Inventory**: Manage medicines with status tracking, low-stock thresholds, and multi-category filters.
- **Sales Workflow**: Integrated sale creation with automatic stock deduction.
- **Purchase Orders**: Track pending orders and update stock upon delivery.
- **Optimized UI**: Responsive design with 10-item pagination for transaction history.
- **Cloud Sync**: Fully synchronized with a high-availability CockroachDB instance.

## 🛠 Setup & Launch

### Backend
1. `cd backend`
2. `pip install -r requirements.txt`
3. `uvicorn main:app --port 3000`

### Frontend
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---
*Developed as part of the intern assignment.*
