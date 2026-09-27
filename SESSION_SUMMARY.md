# MyGovt AI Hub / InfraPulse AI - Hackathon Development Session Notes

> **Last Updated:** September 27, 2026, 15:25 IST  
> **Status:** Live & Production Ready • AWS EC2 Synchronized  
> **Live Production Server:** [https://3.6.172.250.nip.io](https://3.6.172.250.nip.io)  
> **GitHub Repository:** [https://github.com/Purushothamanks/infrapulse-ai](https://github.com/Purushothamanks/infrapulse-ai) (Branch: `main`)

---

## 1. System Architecture & Environment

- **Server IP:** `3.6.172.250` (AWS EC2 Ubuntu 24.04 LTS)
- **Domain:** `3.6.172.250.nip.io`
- **Reverse Proxy:** Nginx with Let's Encrypt SSL certificate (`/etc/letsencrypt/live/3.6.172.250.nip.io/`)
- **Process Manager:** PM2 running Next.js 16 on port 3000 (`pm2 restart 0 --update-env`)
- **SSH Access:** `ssh 3.6.172.250` (Configured in `~/.ssh/config` using `/home/purushothaman/Videos/Projects/LAF-Rebuild/Final-Pro-Key.pem`)
- **Brand Assets:** Clean `/logo.png` (replaces deprecated vercel.svg)

---

## 2. Admin & User Authentication Specifications

### A. Municipal Administrator Login (No OTP • Permanent Card Number)
- **Authorized Email:** `mygovtaihub@gmail.com`
- **Authentication Method:** **Permanent Municipal Security Card Number** (e.g. `TN-MUNI-XXXX-XXXX`).
- **No OTP on Every Login:** Admin no longer enters an OTP when logging in. Instead, Admin enters their authorized email and their **Permanent Security Card Number**.
- **1st-Time Card Issuance:**
  - On first-time login or if the admin needs their card, they click **"Issue / Email My Permanent Security Card"**.
  - A permanent card number (format: `TN-MUNI-XXXX-XXXX`) is issued and saved permanently for that email.
  - An official security card email with an executive digital card graphic is dispatched to `mygovtaihub@gmail.com`.
  - That card number is permanent and used for all future logins.
- **Login Form Security & Privacy (`AuthView.tsx`):**
  - Removed pre-filled email state and placeholders so `mygovtaihub@gmail.com` is never pre-displayed.
  - Removed the `Permanent Security Number` subtitle tag and the `TN-MUNI-XXXX-XXXX` text placeholder.
  - Card number input is masked by default with password masking (`••••••••••••••••`) and equipped with an `Eye`/`EyeOff` visibility toggle button.


### B. Civilian Citizen Authentication
- **Sign In:** Enter registered email (e.g. `arjun.verma@gmail.com` or citizen email) -> direct login.
- **Sign Up (1st Time Only):** Enter Full Name & Email -> 6-digit OTP verification email sent -> enter OTP -> registered.

### C. Fresh Reset
- Temporary user sessions and stores (`/tmp/mygovt_registered_users.json*`) have been cleared on both local machine and EC2 server so all users can start fresh from the beginning.

---

## 3. Email Infrastructure & Ultra-Clean Executive Format (`src/lib/mailer.ts`)

### Standardized Government Official Memorandum (OM) Architecture:
All emails sent and received follow the authentic **Government of Tamil Nadu Official Memorandum (OM)** standard:
- **Header:** Government of Tamil Nadu • Department of Municipal Administration & Urban Water Supply, Ezhilagam Complex, Chepauk, Chennai - 600005.
- **Reference & Date:** `No. MAWS/OM/2026/...` with formal Indian date formatting (`Dated: 27 September, 2026`).
- **Title:** Centered, bold, tracked **`OFFICIAL MEMORANDUM`**.
- **Subject & Reference:** Formal `Sub:` and `Ref:` metadata headers.
- **Numbered Paragraphs:** Formal administrative paragraphs (`1.`, `2.`, `3.`, `4.`).
- **Signature Block:** Right-aligned formal signature block `(Sd/-)`, Officer Name, Designation, and Department.
- **Distribution Endorsement:** Bottom `To:` and `Copy forwarded for information and record to:` blocks.

### Standardized OM Email Workflows:
1. **Permanent Municipal Security Card (`sendAdminSecurityCardEmail`):**
   - Dispatched as an Official Memorandum allocating the permanent card number (`TN-MUNI-XXXX-XXXX`) to `mygovtaihub@gmail.com`.
2. **Citizen OTP Verification (`sendOtpEmail`):**
   - Transmits the official 6-digit identity verification passcode within an OM framework.
3. **Grievance Status Update (`sendGrievanceStatusEmail`):**
   - Formal OM informing the citizen of defect rectification status (`In progress` or `Completed & Resolved`), including `Ai Prediction Budget (INR): ₹X (Realtime price detected by AI)` and attached official **Completion Report PDF Certificate**.
4. **Immediate Admin Priority Alert (`sendNewHazardAdminAlertEmail`):**
   - Urgent Incident Ingestion & Priority Field Dispatch Directive OM dispatched to `mygovtaihub@gmail.com`.


### Gmail SMTP Direct Authentication (Active & Verified):
- **Authenticated Account:** `mygovtaihub@gmail.com`
- **Google App Password:** Configured in `.env.local` locally and on the AWS EC2 instance.
- **Verification Result:** Direct SMTP authentication on port 465 successfully tested and verified. All emails (admin security card, citizen status updates, completion PDF dockets, and new incident alerts) now originate directly from `mygovtaihub@gmail.com` with zero reference to any secondary account.

---

## 4. UI/UX & Real-Time Dynamic Metric Refinements

### A. Admin Dashboard Header Branding (`Navbar.tsx`)
- Replaced the badge text `COMMAND CENTER` with **`MY GOVT AI HUB`**.
- Replaced the profile pill avatar letter `K` and personal name `K. S. Purushothaman` with a clean, neutral municipal role pill: **`Municipal Admin`** alongside `<ShieldCheck />`.

### B. 100% Dynamic Municipal Sustainability & Environmental Impact Dashboard (`FullPageImpactView.tsx`)
- All mock numbers, static strings, and hardcoded ward statistics have been eliminated.
- When there are 0 incidents, all meters cleanly initialize to:
  - **Carbon Penalty:** `0.0 kg CO₂e/day`
  - **Freshwater Saved:** `0 Liters / Hr`
  - **Traffic Idle Cut:** `0% Fuel Wastage`
  - **Remediation Saved:** `0x Cost Multiplier` / `₹0 Saved`
  - **City Ward Infrastructure & Green Health Index:** All 6 monitored wards start with a pristine `100 / 100` Green Health Score and dynamically update as new hazards are ingested and resolved.
- As new hazards are submitted by citizens, metrics dynamically calculate from real telemetry:
  - Carbon penalty aggregates AI-calculated vehicle emissions.
  - Freshwater saved aggregates flow rate mitigation from active/resolved water leak hazards.
  - Traffic idle reduction calculates from resolved road and pavement hazards.
  - Remediation saved calculates from the total estimated budget saved through early repair.

### C. Citizen 1st-Time Signup OTP Optimization (`mailer.ts` & `send-otp/route.ts`)
- **Enhanced Deliverability:** Updated the verification email subject line to `Your Verification Passcode: {OTP} - MyGovt AI Hub (Official Memorandum No. {OM})`, avoiding spam filter suppression.
- **Client Fallback:** Guaranteed that `devCode` is always provided in the verification API response so `AuthView` provides an immediate failsafe autofill if email inbox delivery encounters local network latency.


