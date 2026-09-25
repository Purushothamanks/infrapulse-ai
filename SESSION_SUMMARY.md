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

## 7. File Map & Key Locations

| File | Purpose |
| :--- | :--- |
| `src/components/AuthView.tsx` | Sign In vs Sign Up tabs, clean input fields, contact note |
| `src/context/AuthContext.tsx` | Client session state, `signIn()`, localStorage sanitization |
| `src/components/Navbar.tsx` | Admin navbar with external Logout button and clean display name |
| `src/components/CitizenPortal.tsx` | Citizen lodging interface, records `citizenEmail` |
| `src/components/HazardInspectorModal.tsx` | Admin inspector modal, triggers status update emails |
| `src/app/api/auth/signin/route.ts` | Instant email sign-in for existing users & admin |
| `src/app/api/auth/send-otp/route.ts` | 6-digit OTP dispatch via Gmail SMTP |
| `src/app/api/auth/verify-otp/route.ts` | Verifies OTP and registers account in user store |
| `src/app/api/notifications/status-update/route.ts` | Dispatches status change emails to citizens |
| `src/lib/userStore.ts` | Persistent user registry (`/tmp/mygovt_registered_users.json`) |
| `src/lib/mailer.ts` | Nodemailer SMTP implementation for OTP & status alerts |
| `src/data/mockHazards.ts` | Seeded demo hazards pre-linked to `purushothamank.s799@gmail.com` |

---

## 8. Deployment Workflow Command

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
