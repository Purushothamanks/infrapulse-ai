# 🏗️ InfraPulse AI — Architecture & Engineering Change Log

## 1. Multi-Role Authentication & Access Flow

```
                                [InfraPulse AI Auth Portal]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
             [Admin Official Track]                     [Civilian Citizen Track]
             ├─ Login (Official Gov ID)                 ├─ Login / Email Verification
             └─ Command Center Portal                   ├─ Raise Grievance (Map + Photo)
                ├─ Real-World GIS Map                   └─ Track Live SLA Timeline
                ├─ Triage Queue & SLA Dispatch
                └─ 3-Line Telemetry & KPI Drawer
```

---

## 2. Changes & File Modifications Audit

| Component | Status | Action Taken |
|---|---|---|
| `SYSTEM: OPERATIONAL` | **Removed** | Cleaned up from top navigation bar. |
| 4 Clutter KPI Cards on Main Page | **Refactored** | Removed from page surface; converted into a sleek 3-line collapsible slide-out drawer (`KpiDrawer.tsx`) accessible on demand. |
| AI Vision Scanner Banner | **Removed** | "Try the AI Vision Scanner Live..." / "Open Field Scanner" removed for a clean interface. |
| 3 Pipeline Architecture Cards | **Removed** | "InfraPulse Autonomous AI Pipeline..." (Multimodal Vision, Geospatial, Dispatch) removed. |
| Hackathon Prototype Footer | **Removed** | "InfraPulse AI • 8-Hour Hackathon Prototype • Core CSE Division" removed. |
| Admin Profile & Logout | **Added** | Top right corner profile displaying official's name, role badge, and functional **Logout** button. |
| Authentication System (`AuthView.tsx`) | **Added** | Multi-role portal with **Admin Official Login** and **Civilian Citizen Login**. |
| Email Confirmation Flow | **Added** | 4-digit security code generation & verification to activate accounts and set passwords. |
| Civilian Citizen Desk (`CitizenPortal.tsx`) | **Added** | Dedicated page for citizens to raise grievances, select problem category, upload field photos, pinpoint exact location on Leaflet map, and track live SLA progress. |
| Interactive Location Pin Dropper (`LocationPickerMap.tsx`) | **Added** | Real-world map with drag pin, live device GPS fetch, auto-reverse geocoding, and satellite toggle. |

---

## 3. Directory Layout

```
src/
├── app/
│   ├── api/
│   │   ├── analyze-hazard/route.ts
│   │   └── generate-work-order/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthView.tsx              <-- Dual-role login & email verification
│   ├── CitizenPortal.tsx         <-- Dedicated Citizen Grievance Desk
│   ├── Navbar.tsx                <-- Header with Admin Profile & Logout
│   ├── KpiDrawer.tsx             <-- 3-Line Telemetry & Municipal KPI Drawer
│   ├── RealWorldCityMap.tsx      <-- Tactical GIS City Map
│   ├── LocationPickerMap.tsx     <-- Interactive pin dropper for grievances
│   ├── HazardQueue.tsx           <-- Triage incident queue
│   ├── HazardInspectorModal.tsx  <-- Modal with Work Order generation
│   ├── BottomNav.tsx             <-- Mobile native navigation
│   └── MobileQrModal.tsx         <-- Mobile QR scanner modal
├── context/
│   └── AuthContext.tsx           <-- Auth state & session persistence
└── types/
    ├── auth.ts                   <-- User & Verification interfaces
    └── hazard.ts                 <-- Hazard, Location & Work Order interfaces
```
