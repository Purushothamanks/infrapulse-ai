# MyGovt AI Hub / InfraPulse AI - Hackathon Development Session Notes

> **Generated on:** September 25, 2026, 21:53 IST  
> **Status:** Passed Round 1 • Preparing for Final Round Presentation  
> **Live Production Server:** [https://3.6.172.250.nip.io](https://3.6.172.250.nip.io)  
> **GitHub Repository:** [https://github.com/Purushothamanks/infrapulse-ai](https://github.com/Purushothamanks/infrapulse-ai) (Branch: `main`)

---

## 1. System Architecture & Environment

- **Server IP:** `3.6.172.250` (AWS EC2 Ubuntu 24.04 LTS)
- **Domain:** `3.6.172.250.nip.io`
- **Reverse Proxy:** Nginx with Let's Encrypt SSL certificate (`/etc/letsencrypt/live/3.6.172.250.nip.io/`)
- **Process Manager:** PM2 running Next.js 15 on port 3000 (`pm2 reload 0`)
- **SSH Access:** `ssh 3.6.172.250` (Configured in `~/.ssh/config` using `/home/purushothaman/Videos/Projects/LAF-Rebuild/Final-Pro-Key.pem`)
- **Git User:** `K S Purushothaman <purushothamanks1711@gmail.com>`
- **GitHub PAT:** Authenticated with GitHub credential store (`~/.git-credentials`)

---

## 2. Admin & User Authentication Specifications

### A. Municipal Administrator
- **Authorized Email:** `purushothamank.s799@gmail.com` *(Strictly enforced - no other email is granted admin privileges)*
- **Government Official ID:** `TN-SAMPLE-2026`
- **Official Name:** `K. S. Purushothaman`
- **Department:** `Tamil Nadu Municipal Administration & Urban Water Supply`
- **Title Rule:** The word `"Commissioner"` has been completely purged from the codebase, sessions, and emails.
- **Support Contact displayed in UI:** `For any issue , reach : purushothamank.s799@gmail.com`

### B. Sign In vs Sign Up Mechanics (`src/components/AuthView.tsx`)
1. **Sign In Mode (`authMode === 'signin'`)**:
   - **For Returning Admin:** Admin enters `purushothamank.s799@gmail.com` and clicks *"Sign In as Municipal Admin"*. Immediate 1-click login without OTP!
   - **For Returning Citizen:** Citizen enters their email (e.g. `arjun.verma@gmail.com` or previously verified email) and clicks *"Sign In to Citizen Portal"*. Immediate login without OTP!
   - **Unregistered Emails:** If an unknown email attempts to Sign In, the UI informs them: *"Account not registered yet. Please select the 'Sign Up (1st Time Only)' tab to complete one-time email OTP verification."*
2. **Sign Up Mode (`authMode === 'signup'`)**:
   - Dedicated exclusively for **1st-time new users**.
   - Citizens provide Full Name & Email.
   - Dispatches a 6-digit OTP via real **Gmail SMTP**.
   - Admin registration requires both the 6-digit OTP and Government Official ID `TN-SAMPLE-2026`.
   - On successful verification, the account is stored permanently in `src/lib/userStore.ts` (`/tmp/mygovt_registered_users.json`), allowing instant future logins via the Sign In tab.

---

## 3. Real-Time SMTP Email Services (`src/lib/mailer.ts`)

- **Host:** `smtp.gmail.com` (Port 465 SSL)
- **Account:** `purushothamank.s799@gmail.com`
- **Credentials:** Configured in `.env.local` locally and on the server.
- **Key Email Notifications:**
  1. `sendOtpEmail`: Sends the 6-digit verification code (and Government Official ID `TN-SAMPLE-2026` for admin).
  2. `sendGrievanceStatusEmail`: Automated email dispatched to the citizen whenever an admin changes grievance stage to `In progress` or `Completed`, or generates a work order docket.

---

## 4. Automated Citizen Grievance Tracking Pipeline

- **Reporting (`src/components/CitizenPortal.tsx`):**
  - When a citizen lodges a complaint, their email (`user.email`) is attached to `newReport.citizenEmail`.
  - Report syncs across devices via `/api/hazards`.
- **Review & Stage Update (`src/components/HazardInspectorModal.tsx`):**
  - Municipal Admin inspects the incident on the GIS map or queue.
  - When the admin switches stage to **"In progress"** or **"Completed"**, or clicks **"Generate Work Order"**, the client dispatches a POST request to `/api/notifications/status-update`.
  - A real email notification is immediately delivered to the citizen's inbox with:
    - Incident Title & Grievance ID
    - Live Status Badge (`IN PROGRESS` or `COMPLETED & RESOLVED`)
    - Exact Location & Municipal Ward
    - Assigned Contractor & SLA Dispatch Window
    - Authorized Officer: `K. S. Purushothaman (Municipal Administration)`
  - Confirmation toast appears in modal: `Automated email notification sent to <citizen-email> (<stage>)`.

---

## 5. Top Navbar Design (`src/components/Navbar.tsx`)

- Redundant dropdown removed.
- Prominent Admin profile pill: `K. S. Purushothaman` • `Municipal Admin`.
- **Outside Logout Button:** Directly visible and clickable right next to the profile pill in the top navbar (`<button onClick={logout}>` with `LogOut` icon).

---

## 6. Real Multimodal AI Vision & Work Orders

1. **Gemini Flash Vision (`/api/analyze-hazard`):**
   - True pixel analysis evaluating asphalt sub-base erosion, radial rim cracking, crater depth, and CO2 penalty.
   - Graceful fallback for synthetic offline testing.
2. **Official Work Order Docket (`OfficialWorkOrderPdfModal.tsx`):**
   - High-fidelity printable docket with QR code, contractor dispatch details, and digital signature by `K. S. Purushothaman`.

---

## 7. Universal Real-Time Cross-Device Synchronization

- **Persistent Cloud Backend (`src/lib/hazardStore.ts`):**
  - Stores all incidents in persistent `data/hazards_store.json` with in-memory caching and atomic file writes.
  - No longer relies solely on transient `/tmp`.
- **Client-Side Image Auto-Compression (`src/components/CitizenPortal.tsx`):**
  - High-res camera photos (5-15 MB) are automatically resized via offscreen HTML5 `<canvas>` to max 960px with 72% JPEG quality (~40-60 KB).
  - Enables instant sub-second upload and prevents network timeouts/aborts on mobile.
- **Snappy 2-Second Polling with Audio Chime (`src/app/page.tsx`):**
  - Real-time polling every 2 seconds with `Cache-Control: no-store, no-cache`.
  - ID-set diffing detects incoming hazards posted by any external phone or device.
  - Synthesized Web Audio API dispatch chime plays when a live incident lands from mobile.
  - Pops up the live incident banner: `🚨 Live Incident Synced from Mobile Device` with direct inspection action.
- **Shared Live QR Code (`src/components/MobileQrModal.tsx`):**
  - QR Code defaults directly to `https://3.6.172.250.nip.io` so mobile devices join the exact same cloud environment as the admin laptop.

---

## 8. File Map & Key Locations

| File | Purpose |
| :--- | :--- |
| `src/components/AuthView.tsx` | Sign In vs Sign Up tabs, clean input fields, contact note |
| `src/context/AuthContext.tsx` | Client session state, `signIn()`, localStorage sanitization |
| `src/components/Navbar.tsx` | Admin navbar with external Logout button, clean display name, and LIVE CLOUD SYNC badge |
| `src/components/CitizenPortal.tsx` | Citizen lodging interface, image auto-compression, LIVE CLOUD SYNC badge |
| `src/components/MobileQrModal.tsx` | QR code pointing by default to live cloud server |
| `src/components/HazardInspectorModal.tsx` | Admin inspector modal, triggers status update emails |
| `src/app/page.tsx` | Universal 2s cross-device incident sync, audio chime, live alert banner |
| `src/app/api/hazards/route.ts` | Server hazard store endpoint with strict no-cache headers |
| `src/app/api/auth/signin/route.ts` | Instant email sign-in for existing users & admin |
| `src/app/api/auth/send-otp/route.ts` | 6-digit OTP dispatch via Gmail SMTP |
| `src/app/api/auth/verify-otp/route.ts` | Verifies OTP and registers account in user store |
| `src/app/api/notifications/status-update/route.ts` | Dispatches status change emails to citizens |
| `src/lib/hazardStore.ts` | Persistent cloud database (`data/hazards_store.json`) with in-memory caching |
| `src/lib/userStore.ts` | Persistent user registry (`/tmp/mygovt_registered_users.json`) |
| `src/lib/mailer.ts` | Nodemailer SMTP implementation for OTP & status alerts |
| `src/data/mockHazards.ts` | Seeded demo hazards pre-linked to `purushothamank.s799@gmail.com` |

---

## 9. Deployment Workflow Command

To deploy any future updates to the AWS live server without memory bottlenecks:

```bash
# 1. Sync files to AWS
rsync -avz --exclude='node_modules' --exclude='.next' --exclude='.git' /home/purushothaman/infrapulse-ai/ 3.6.172.250:/home/ubuntu/infrapulse-ai/

# 2. Build on AWS and reload PM2
ssh 3.6.172.250 "cd /home/ubuntu/infrapulse-ai && rm -rf .next && npm run build && pm2 reload 0"

# 3. Commit and push to GitHub
cd /home/purushothaman/infrapulse-ai
git add .
git commit -m "your commit message"
git push origin main
```

---

## 10. Community Civic Feed & AI Hazard Verification (Latest Update)

### A. Community Civic Feed vs Personal Grievances Separation
- **Personal Tracking (`activeTab === 'history'`):**
  - Shows strictly the complaints lodged by the logged-in citizen (`hazard.citizenEmail === user.email`).
  - When empty, displays a clean citizen-oriented guidance screen.
  - Allows the citizen to inspect their personal 3-step progress bar (`1. Not started`, `2. In progress`, `3. Completed`) and withdraw/delete their complaint.
- **Community Civic Feed (`activeTab === 'community'`):**
  - Dedicated tab where citizens can explore public defects reported across all municipal wards.
  - Interactive **Upvote / Endorse** button (`▲ Upvote (X)`) to let citizens support high-risk community complaints, instantly boosting municipal triage prioritization across all connected devices in real time.
  - Category filters (`All`, `Potholes`, `Water Mains`, `Structural`, `Waste`, `Electrical`, `Solar`) + live search by street address, ward, or defect ID.
- **4-Item Fixed Bottom Navigation Dock:**
  1. `Raise` (Camera icon)
  2. `My Reports` (Clock icon with badge showing count of personal grievances)
  3. `Community` (Users icon with badge showing count of public incidents)
  4. `Help & Support` (LifeBuoy icon opening official TN Government helpline modal)

### B. AI Defect Verification & Animal / Non-Hazard Rejection
- **Problem Solved:** Previously, unclassified uploads defaulted to a 92% confidence pothole, causing photos of animals/pets to be accepted into the municipal database.
- **Strict Verification Architecture:**
  1. **Keyword Pre-Screening:** Fast rejection if description contains animal keywords (`dog`, `cat`, `animal`, `pet`, `cow`, `buffalo`, `bird`, `monkey`, `snake`, etc.) or non-hazard terms (`selfie`, `person`, `food`, `sofa`, `furniture`, `room`, etc.).
  2. **Client & Server Chromatic/Texture Verification:** Real-time analysis of pixel histograms comparing organic/warm fur & skin tones (`R > G + 22` and `R > B + 28`) against neutral roadway asphalt/concrete greys (`|R - G| < 22` and `|G - B| < 22`).
  3. **Multimodal Cloud Vision Inspection:** Integrated with Google Gemini 1.5 Flash Vision / OpenAI Vision (`gpt-4o-mini`) via two-step verification prompt that strictly rejects non-infrastructure images with `{ "isValidHazard": false, "detectedObject": "..." }`.
  4. **422 Rejection Response & Citizen Alert Modal:** If an image is flagged as an animal or non-hazard, `/api/analyze-hazard` responds with HTTP 422. `CitizenPortal` intercepts the rejection and renders a user-friendly alert modal explaining why the photo was rejected and prompting the citizen to upload a photo of an active municipal infrastructure defect.

