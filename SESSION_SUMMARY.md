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

### B. Civilian Citizen Authentication
- **Sign In:** Enter registered email (e.g. `arjun.verma@gmail.com` or citizen email) -> direct login.
- **Sign Up (1st Time Only):** Enter Full Name & Email -> 6-digit OTP verification email sent -> enter OTP -> registered.

### C. Fresh Reset
- Temporary user sessions and stores (`/tmp/mygovt_registered_users.json*`) have been cleared on both local machine and EC2 server so all users can start fresh from the beginning.

---

## 3. Email Infrastructure & Ultra-Clean Executive Format (`src/lib/mailer.ts`)

### Redesigned Modern Minimalist Templates
All email templates have been redesigned from heavy government tables to an ultra-clean executive standard (Stripe / Apple / Gov.uk aesthetic):
- Subtle neutral background (`#f8fafc`), clean 16px rounded card, delicate 1px border (`#e2e8f0`), soft shadow.
- High-contrast typography with system fonts.
- Clean key-value dossier rows with subtle borders.
- Pill status badges (`Completed & Resolved`, `In Progress`, `Critical Severity`).

### Email Types:
1. **Permanent Municipal Security Card (`sendAdminSecurityCardEmail`):**
   - Dispatches a digital Security Card graphic with the permanent Card Number (`TN-MUNI-XXXX-XXXX`).
   - Addressed to `mygovtaihub@gmail.com`.
2. **Citizen OTP Verification (`sendOtpEmail`):**
   - Clean 6-digit verification code block for 1st-time citizen registration.
3. **Grievance Status Update (`sendGrievanceStatusEmail`):**
   - Dispatched to citizen when stage is updated (`In progress` or `Completed`).
   - Displays: Incident title, location, ward, `Ai Prediction Budget (INR): ₹X (Realtime price detected by AI)`.
   - Attaches official **Completion Report PDF Certificate** when marked as `Completed`.
4. **Immediate Admin Alert (`sendNewHazardAdminAlertEmail`):**
   - Dispatched to `mygovtaihub@gmail.com` immediately whenever a citizen logs a new hazard.
   - Includes real-time AI budget prediction, coordinates, citizen contact, and direct link to command center.

### Gmail SMTP Direct Authentication (Active & Verified):
- **Authenticated Account:** `mygovtaihub@gmail.com`
- **Google App Password:** Configured in `.env.local` locally and on the AWS EC2 instance.
- **Verification Result:** Direct SMTP authentication on port 465 successfully tested and verified. All emails (admin security card, citizen status updates, completion PDF dockets, and new incident alerts) now originate directly from `mygovtaihub@gmail.com` with zero reference to any secondary account.

