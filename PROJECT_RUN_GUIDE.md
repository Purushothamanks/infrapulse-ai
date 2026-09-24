# 🚀 InfraPulse AI - Hackathon Quick Run & Demo Guide

**Project:** InfraPulse AI — Autonomous Urban Infrastructure Triage & Sustainable Civic Action Copilot  
**Theme:** Urban Infrastructure & Sustainability (AI Tools Usage)  
**Live Desktop URL:** [http://localhost:3000](http://localhost:3000)  
**Live Mobile Public HTTPS URL (Any phone/network):** [https://high-tion-best-futures.trycloudflare.com](https://high-tion-best-futures.trycloudflare.com)  
**Local Wi-Fi Mobile URL:** `http://10.121.226.91:3000`  

---

## 🔐 1. Multi-Role Authentication & Access

When visiting the platform, users are greeted with a secure login & registration portal with two distinct operational tracks:

### A. 🏢 Municipal Official / Admin Login
- **Demo Credentials:** `admin@infrapulse.gov` / `admin123`
- **1-Click Quick Login:** Click *"⚡ Municipal Admin (Commissioner Mohan)"* at the bottom of the card.
- **Access Granted:** Direct access to the **Admin Command Center**:
  - Real-World City GIS Map (OpenStreetMap & High-Res Satellite).
  - Live Triage Priority Queue.
  - Work Order generation with material logistics and contractor dispatch.
  - **3-Line Menu (`Telemetry & KPIs`):** Click to view the 4 core municipal metrics in a sleek slide-out drawer.
  - **Top Right Admin Profile:** Displays the official's name, verified badge, and **Log Out** button.

### B. 👤 Civilian Citizen Grievance Portal
- **Demo Credentials:** `citizen@gmail.com` / `user123`
- **1-Click Quick Login:** Click *"⚡ Civilian Citizen (Arjun Verma)"* at the bottom of the card.
- **Registration Flow with Email Confirmation:**
  1. Click *"Register & verify email"*.
  2. Enter Name & Email -> Click *"Send Email Confirmation Code"*.
  3. Enter the 4-digit security code generated for verification.
  4. Set password and activate account!
- **Access Granted:** Dedicated **Citizen Desk**:
  - **Raise New Grievance:**
    1. Select problem category (Pothole, Water Main, Bridge Crack, Waste Dump, Broken Streetlight, Solar).
    2. Upload field photo or test with pre-loaded demo pictures.
    3. Interactive Real-World Map: Tap/click anywhere to drop pin, or tap **GPS** for current coordinates with auto-reverse geocoded street address.
    4. Submit grievance to municipal authorities.
  - **Track Grievances:** Live progress timeline (*Reported* ➔ *AI Triaged* ➔ *Dispatched to Contractor* ➔ *Fixed*).
  - **Profile & Logout** in header.

---

## 📸 2. Demo Pictures Location

The 6 sample hazard images are placed in your system's `Pictures` directory:

📁 **Location on your Computer:**
```
/home/purushothaman/Pictures/InfraPulse-Demo-Pictures/
```

1. `1_severe_pothole_crater.png` / `.svg` (Pothole crater)
2. `2_water_main_rupture.png` / `.svg` (Water main burst)
3. `3_structural_flyover_crack.png` / `.svg` (Flyover shear fissure)
4. `4_illegal_waste_dump.png` / `.svg` (Illegal dumping)
5. `5_broken_smart_streetlight.png` / `.svg` (Exposed 230V live wire)
6. `6_solar_grid_damage.png` / `.svg` (Photovoltaic grid damage)

---

## 🎯 3. Winning 3-Minute Hackathon Demo Script (For Judges)

### Step 1: Open the Portal & Showcase Multi-Role Architecture (30 seconds)
> *"Judges, urban infrastructure requires two key stakeholders: the **Citizens** who spot problems on the street, and the **Municipal Officials** who dispatch repair crews. InfraPulse AI connects both through a unified AI vision & geospatial platform."*
- Show the Login screen with **Admin Official** vs **Civilian Citizen** portals.
- Point out the **Email Confirmation** security verification flow.

### Step 2: Showcase the Civilian Citizen Desk (60 seconds)
1. 1-Click login as **Civilian Citizen**.
2. Select **"Road Pothole / Crater"**.
3. Point out the **Interactive Map**: Show how a citizen can click to drop a pin or tap **GPS** to pull live device coordinates with automatic reverse geocoding.
4. Click **"Submit Grievance to Municipal Portal"**.
5. Switch to **"Track Grievances"**: Show the citizen tracking the live SLA progress (*AI Triaged ➔ Dispatched to Contractor*).
6. Click **Logout**.

### Step 3: Showcase the Admin Command Center (60 seconds)
1. 1-Click login as **Municipal Admin (Commissioner Mohan)**.
2. Show that the grievance reported by the citizen is already live on the **Tactical GIS Map** with a pulsing red marker!
3. Click the **3-Line Menu ("Telemetry & KPIs")**: Open the slide-out drawer showing Critical Queue, Emission Risk (kg CO₂e/day), and AI Triage Latency.
4. Click on the newly reported hazard ➔ Click **"Issue Work Order"** ➔ System auto-assigns municipal contractors, calculates budget, and allocates asphalt/pipes.

### Step 4: Show Top Right Profile & Mobile View (30 seconds)
- Click the **Admin Profile** in the top right to display official credentials and **Logout**.
- Click **"Mobile View"** to display the on-screen **QR Code** so judges can scan it directly with their phone cameras!

---

## 🛠️ 4. Tech Stack & Commands

```bash
# Start dev server
npm run dev -- -p 3000

# Production build
npm run build
npm run start -- -p 3000
```
