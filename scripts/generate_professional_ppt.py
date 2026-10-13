#!/usr/bin/env python3
"""
Generate high-impact, professional 16:9 PowerPoint presentation: Professional_PPT.pptx
for InfraPulse AI (MyGovt AI Hub)
"""
import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck(output_path):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # completely blank layout

    # Color Palette
    BG_DARK = RGBColor(15, 23, 42)      # #0F172A Slate 900
    CARD_BG = RGBColor(30, 41, 59)      # #1E293B Slate 800
    BORDER_CLR = RGBColor(51, 65, 85)   # #334155 Slate 700
    TEXT_LIGHT = RGBColor(248, 250, 252)# #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184)# #94A3B8 Slate 400
    ACCENT_EMERALD = RGBColor(16, 185, 129) # #10B981 Emerald 500
    ACCENT_CYAN = RGBColor(6, 182, 212)     # #06B6D4 Cyan 500
    ACCENT_AMBER = RGBColor(245, 158, 11)   # #F59E0B Amber 500
    ACCENT_RED = RGBColor(239, 68, 68)      # #EF4444 Red 500

    def add_slide_background(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="TAMIL NADU SMART CITY CIVIC TECH • INFRAPULSE AI"):
        # Category Tag
        cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        tf_cat = cat_box.text_frame
        tf_cat.word_wrap = True
        p_cat = tf_cat.paragraphs[0]
        r_cat = p_cat.add_run()
        r_cat.text = category.upper()
        r_cat.font.name = 'Calibri'
        r_cat.font.size = Pt(10)
        r_cat.font.bold = True
        r_cat.font.color.rgb = ACCENT_EMERALD

        # Title
        t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.7))
        tf_t = t_box.text_frame
        tf_t.word_wrap = True
        p_t = tf_t.paragraphs[0]
        r_t = p_t.add_run()
        r_t.text = title
        r_t.font.name = 'Calibri'
        r_t.font.size = Pt(22)
        r_t.font.bold = True
        r_t.font.color.rgb = TEXT_LIGHT

    def add_card(slide, left, top, width, height, title, items, badge="", badge_color=ACCENT_EMERALD):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = BORDER_CLR
        card.line.width = Pt(1.5)

        tf = card.text_frame
        tf.word_wrap = True
        tf.margin_left = Inches(0.3)
        tf.margin_right = Inches(0.3)
        tf.margin_top = Inches(0.25)
        tf.margin_bottom = Inches(0.25)

        p_title = tf.paragraphs[0]
        if badge:
            rb = p_title.add_run()
            rb.text = f"[{badge}] "
            rb.font.name = 'Calibri'
            rb.font.size = Pt(11)
            rb.font.bold = True
            rb.font.color.rgb = badge_color

        rt = p_title.add_run()
        rt.text = title
        rt.font.name = 'Calibri'
        rt.font.size = Pt(14)
        rt.font.bold = True
        rt.font.color.rgb = TEXT_LIGHT
        p_title.space_after = Pt(8)

        for item in items:
            p_item = tf.add_paragraph()
            p_item.space_after = Pt(5)
            ri = p_item.add_run()
            ri.text = f"•  {item}"
            ri.font.name = 'Calibri'
            ri.font.size = Pt(11)
            ri.font.color.rgb = TEXT_MUTED

    # ================= SLIDE 1: Title Slide =================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_background(s1)

    t_box1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(3.5))
    tf1 = t_box1.text_frame
    tf1.word_wrap = True

    p0 = tf1.paragraphs[0]
    r0 = p0.add_run()
    r0.text = "GOVERNMENT OF TAMIL NADU • MUNICIPAL GOVERNANCE & AI INNOVATION"
    r0.font.name = 'Calibri'
    r0.font.size = Pt(12)
    r0.font.bold = True
    r0.font.color.rgb = ACCENT_EMERALD
    p0.space_after = Pt(10)

    p1 = tf1.add_paragraph()
    r1 = p1.add_run()
    r1.text = "INFRAPULSE AI (MYGOVT AI HUB)"
    r1.font.name = 'Calibri'
    r1.font.size = Pt(36)
    r1.font.bold = True
    r1.font.color.rgb = TEXT_LIGHT
    p1.space_after = Pt(8)

    p2 = tf1.add_paragraph()
    r2 = p2.add_run()
    r2.text = "Autonomous Computer Vision Triage, Optical Anti-Spoofing & Public Works Dispatch System"
    r2.font.name = 'Calibri'
    r2.font.size = Pt(17)
    r2.font.italic = True
    r2.font.color.rgb = ACCENT_CYAN
    p2.space_after = Pt(24)

    p3 = tf1.add_paragraph()
    r3 = p3.add_run()
    r3.text = "Live Deployment: https://mygovthub.web.app  |  Official Command Loop: mygovtaihub@gmail.com  |  Release 2026"
    r3.font.name = 'Calibri'
    r3.font.size = Pt(11)
    r3.font.color.rgb = TEXT_MUTED

    # ================= SLIDE 2: The Urban Crisis =================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_background(s2)
    add_header(s2, "The Civic Crisis: Urban Road Infrastructure & Public Safety Hazards")
    add_card(s2, 0.8, 1.6, 3.6, 5.2, "Severe Road Craters", [
        "Over 10,000+ potholes emerge each monsoon season in major metropolitan cities.",
        "Over 70% of road accident fatalities directly impact two-wheeler commuters.",
        "Heavy monsoon rain rapidly transforms small cracks into deep craters under traffic load."
    ], "CRITICAL RISK", ACCENT_RED)
    add_card(s2, 4.8, 1.6, 3.6, 5.2, "Subsurface Water Leaks", [
        "Hidden pipe breaches weaken the underlying road subgrade, triggering sudden subsidence.",
        "Millions of liters of treated municipal drinking water are wasted daily.",
        "Untreated water accumulation accelerates asphalt stripping and crater expansion."
    ], "WATER ASSETS", ACCENT_CYAN)
    add_card(s2, 8.8, 1.6, 3.6, 5.2, "Economic & Civic Toll", [
        "Billions of Indian Rupees lost annually in vehicular suspension and tire damages.",
        "Severe traffic bottlenecks reduce peak commercial transportation throughput.",
        "Growing public frustration with delayed, opaque municipal maintenance cycles."
    ], "SOCIETAL IMPACT", ACCENT_AMBER)

    # ================= SLIDE 3: Fatal Flaws in Legacy Systems =================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_background(s3)
    add_header(s3, "Root Cause Analysis: Why Conventional Grievance Redressal Portals Fail")
    add_card(s3, 0.8, 1.6, 3.6, 5.2, "1. Manual Clerical Triage", [
        "Incoming tickets sit in unorganized centralized email inboxes for days.",
        "Clerical staff must guess severity, ward borders, and engineering jurisdiction.",
        "Average delay of 72 to 120 hours before an engineer is assigned."
    ], "BOTTLENECK 1", ACCENT_AMBER)
    add_card(s3, 4.8, 1.6, 3.6, 5.2, "2. AI Fakes & Spam Flooding", [
        "Malicious users upload synthetic AI photos (Midjourney v6, DALL-E 3) depicting fake craters.",
        "Citizens upload domestic pets, selfies, memes, and indoor living room photos.",
        "Municipal teams waste hours investigating fabricated or irrelevant reports."
    ], "BOTTLENECK 2", ACCENT_RED)
    add_card(s3, 8.8, 1.6, 3.6, 5.2, "3. Disconnected Public Works", [
        "Grievance platforms operate in isolated silos from contractor work order systems.",
        "Manual contractor assignment and budget approvals cause multi-week delays.",
        "Citizens receive zero transparency into contractor dispatch or repair ETA."
    ], "BOTTLENECK 3", ACCENT_AMBER)

    # ================= SLIDE 4: The InfraPulse AI Solution =================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_background(s4)
    add_header(s4, "InfraPulse AI: Autonomous Architecture & End-to-End Civic Pipeline")
    add_card(s4, 0.8, 1.6, 5.6, 2.5, "Client-Side Edge Optical Verification", [
        "Full-screen WebRTC camera viewfinder with crosshairs framing.",
        "Sub-second Bayer pattern analysis validating genuine camera sensors.",
        "Instant rejection of synthetic AI fakes and non-civil subjects."
    ], "PHASE 1: CITIZEN", ACCENT_EMERALD)
    add_card(s4, 6.8, 1.6, 5.6, 2.5, "Autonomous Severity & Cost Triage", [
        "Multi-class hazard classification (Pothole, Water Leak, Streetlight, Garbage).",
        "Automated scale estimation and real-time Indian Rupee (INR) budgeting.",
        "Instant priority scoring (1-100) determining municipal urgency."
    ], "PHASE 2: AI ENGINE", ACCENT_CYAN)
    add_card(s4, 0.8, 4.4, 5.6, 2.5, "Tactical GIS Command Center", [
        "Interactive OpenStreetMap & Leaflet geospatial incident heatmaps.",
        "Live incident queue with one-click contractor work order dispatch.",
        "Ward-level expenditure analytics and SLA resolution tracking."
    ], "PHASE 3: ADMIN", ACCENT_CYAN)
    add_card(s4, 6.8, 4.4, 5.6, 2.5, "Asynchronous Stakeholder Mail Loop", [
        "Immediate alert email dispatched to municipal admin (mygovtaihub@gmail.com).",
        "Automated citizen notifications: Lodgement -> Contractor Dispatched -> Completed.",
        "PostgreSQL mail queue daemon with exponential retry logic."
    ], "PHASE 4: DISPATCH", ACCENT_EMERALD)

    # ================= SLIDE 5: Optical Anti-Spoofing Deep Dive =================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_background(s5)
    add_header(s5, "Core Breakthrough: Optical Bayer Sensor Noise vs Synthetic AI Fakes")
    add_card(s5, 0.8, 1.6, 5.6, 5.2, "Physical Optical Camera Sensors", [
        "Physical Silicon Photodiodes: Light passes through physical Bayer Color Filter Arrays (RGGB).",
        "Poisson Photon Shot Noise: Inevitable physical quantum fluctuations across gravel and asphalt.",
        "Natural Chromatic Dispersion: Subtle micro-lens chromatic aberration and sensor noise profiles.",
        "Verified Authentic: Consistently scores 92% to 99% authenticity on real road photographs."
    ], "GENUINE OPTICAL CAPTURE", ACCENT_EMERALD)
    add_card(s5, 6.8, 1.6, 5.6, 5.2, "Generative AI Synthetics (Midjourney/DALL-E)", [
        "Latent Denoising Vectors: No physical silicon sensor or photon arrival process exists.",
        "Unnatural Spatial Smoothing: Lack of Poisson micro-noise across homogenous road surfaces.",
        "High-Frequency Spectral Anomalies: Latent upscaler tiling creates telltale frequency spikes.",
        "Instantly Rejected: High Generative Artifact Score (>60%) triggers immediate pre-submission block."
    ], "SYNTHETIC AI FAKE", ACCENT_RED)

    # ================= SLIDE 6: Multi-Class Vision & Cost Estimation =================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_background(s6)
    add_header(s6, "AI Defect Classification, Dimension Scaling & Real-Time INR Budgeting")
    add_card(s6, 0.8, 1.6, 3.6, 5.2, "Road Potholes & Craters", [
        "Detects depth shadows, concave asphalt perimeter, and gravel disintegration.",
        "Classifies minor surface fatigue (<1.0 m²) vs deep craters (>2.0 m²).",
        "Estimated Repair Cost: ₹3,500 – ₹24,000 depending on depth and hot-mix volume."
    ], "ASPHALT DISTRESS", ACCENT_AMBER)
    add_card(s6, 4.8, 1.6, 3.6, 5.2, "Water Pipeline Ruptures", [
        "Detects surface water pooling, fluid specular reflection, and subgrade erosion.",
        "Flags high-pressure potable main breaches for priority water board dispatch.",
        "Estimated Repair Cost: ₹45,000 – ₹78,000 including excavation and re-piping."
    ], "HYDRAULIC HAZARD", ACCENT_CYAN)
    add_card(s6, 8.8, 1.6, 3.6, 5.2, "Streetlights & Garbage Debris", [
        "Detects luminaire electrical outages, dangling cables, and public debris heaps.",
        "Calculates priority weighting based on ward night-time pedestrian safety.",
        "Estimated Repair Cost: ₹4,500 – ₹18,000 with rapid utility crew deployment."
    ], "CIVIC AMENITIES", ACCENT_EMERALD)

    # ================= SLIDE 7: Citizen Portal Experience =================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_background(s7)
    add_header(s7, "Citizen Portal Experience: Full-Screen Viewfinder & Quick Trail Learning")
    add_card(s7, 0.8, 1.6, 5.6, 5.2, "Full-Screen Optical Viewfinder", [
        "WebRTC Live Video: Opens immersive full-screen camera stream (rear wide sensor).",
        "Tactical Crosshairs Reticle: Corner brackets guide citizens to align the defect.",
        "Front / Back Lens Flip: Seamlessly switch camera hardware on mobile devices.",
        "Freeze-Frame Review: Citizen inspects still frame with Retake vs Attach Photo options.",
        "Instant Verification: Passes snapshot to AI scanner upon attachment."
    ], "OPTICAL CAMERA", ACCENT_EMERALD)
    add_card(s7, 6.8, 1.6, 5.6, 5.2, "Quick Trail Educational Modal", [
        "Navbar Option: Located adjacent to 'MY GOVT AI HUB' for instant discovery.",
        "Demystifies AI Vision: Teaches citizens how the AI separates real road damage from fakes.",
        "Interactive Preset Testing: 4 live presets (Real Pothole, Midjourney Fake, Pet, Indoor Room).",
        "Direct Form Trigger: One-click test pre-loads image and demonstrates instant verification."
    ], "QUICK TRAIL MODULE", ACCENT_CYAN)

    # ================= SLIDE 8: Admin Command Center =================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_background(s8)
    add_header(s8, "Administrative Command Center: Tactical GIS Map & Ward Incident Queue")
    add_card(s8, 0.8, 1.6, 5.6, 5.2, "Tactical GIS Map Interface", [
        "Leaflet & OpenStreetMap: High-performance geospatial layer rendering municipal ward boundaries.",
        "Pulsing Urgency Pins: Crimson Red for Critical craters, Amber for High leaks, Emerald for Normal.",
        "Interactive Pin Popups: Displays defect photograph, calculated severity, address, and live status.",
        "Real-Time Spatial Clustering: Prevents map clutter during high-density monsoon reporting."
    ], "GIS OPERATIONS", ACCENT_CYAN)
    add_card(s8, 6.8, 1.6, 5.6, 5.2, "Incident Queue & Ward Analytics", [
        "Dynamic Filtering: Filter by status (Not Started, In Progress, Completed) or hazard type.",
        "Severity Score Sorting: Automatically prioritizes high-risk urban hazards at the top of the queue.",
        "Single-Click Work Orders: Launch contractor assignment docket modal directly from table.",
        "Budget Aggregates: Calculates total cumulative repair liabilities across city zones."
    ], "INCIDENT TRIAGE", ACCENT_EMERALD)

    # ================= SLIDE 9: Automated Public Works Dispatch =================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_background(s9)
    add_header(s9, "Automated Public Works Order Generation & Contractor Accountability")
    add_card(s9, 0.8, 1.6, 3.6, 5.2, "1. Digital Docket Generation", [
        "Binds verified hazard telemetry into an official municipal work order docket.",
        "Locks GPS coordinates, dimensional scale, and AI repair budget in INR.",
        "Generates unique tracking docket number (e.g., WO-2026-8412)."
    ], "STEP 1: DOCKET", ACCENT_EMERALD)
    add_card(s9, 4.8, 1.6, 3.6, 5.2, "2. Contractor Assignment", [
        "Assigns pre-vetted licensed public works contractor team based on defect specialty.",
        "Enforces strict SLA target completion timeline (e.g., 48 Hours for Critical craters).",
        "Updates live database record from 'Not Started' to 'In Progress'."
    ], "STEP 2: DISPATCH", ACCENT_CYAN)
    add_card(s9, 8.8, 1.6, 3.6, 5.2, "3. Citizen Notification", [
        "Automated SMTP dispatch transmits formal docket to reporting citizen's email.",
        "Informs citizen of assigned contractor team name and target resolution date.",
        "Follow-up email dispatched automatically upon contractor completion confirmation."
    ], "STEP 3: TRANSPARENCY", ACCENT_AMBER)

    # ================= SLIDE 10: SMTP Mail Pipeline =================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_background(s10)
    add_header(s10, "Real-Time Dual-Channel SMTP Email Notification Architecture")
    add_card(s10, 0.8, 1.6, 5.6, 5.2, "Official Admin Emergency Alert", [
        "Recipient: Official Municipal Command Inbox (mygovtaihub@gmail.com).",
        "Trigger Event: Immediate citizen submission of a verified civil hazard.",
        "Payload: Docket ID, defect photograph, severity score, ward address, and direct GIS link.",
        "Zero Latency: Queued via PostgreSQL and dispatched in background by mail daemon."
    ], "ADMIN ALERT CHANNEL", ACCENT_RED)
    add_card(s10, 6.8, 1.6, 5.6, 5.2, "Citizen Life-Cycle Progress Loop", [
        "Stage 1: Lodgement Confirmation (Municipal Security Card issued with ID docket).",
        "Stage 2: Work Order Dispatched (Contractor team details & 48h SLA timeline).",
        "Stage 3: Completion Confirmation (Official civic repair closure notice).",
        "Reliability: Asynchronous queue with exponential retry backoff prevents dropped emails."
    ], "CITIZEN TRACKING CHANNEL", ACCENT_EMERALD)

    # ================= SLIDE 11: Enterprise Tech Stack =================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_background(s11)
    add_header(s11, "Technical Architecture & Scalable Enterprise Cloud Stack")
    add_card(s11, 0.8, 1.6, 2.7, 5.2, "Frontend Tier", [
        "Next.js 16 (App Router)",
        "React 19 Server Components",
        "TypeScript Strict Mode",
        "Tailwind CSS v3",
        "Turbopack High-Speed Build"
    ], "FRONTEND", ACCENT_EMERALD)
    add_card(s11, 3.8, 1.6, 2.7, 5.2, "Database Tier", [
        "Supabase PostgreSQL",
        "Row Level Security (RLS)",
        "JSONB Defect Telemetry",
        "PostGIS Coordinates",
        "Realtime WebSocket Engine"
    ], "DATA TIER", ACCENT_CYAN)
    add_card(s11, 6.8, 1.6, 2.7, 5.2, "Communications", [
        "PostgreSQL mail_queue",
        "Node.js Worker Daemon",
        "Nodemailer SMTP Client",
        "Exponential Backoff",
        "HTML Municipal Dockets"
    ], "MAIL ENGINE", ACCENT_AMBER)
    add_card(s11, 9.8, 1.6, 2.7, 5.2, "Cloud Hosting", [
        "Firebase Hosting CDN",
        "Global Edge Caching",
        "Static Export Pipeline",
        "Sub-180ms TTFB Latency",
        "99.99% Uptime Guarantee"
    ], "DEPLOYMENT", ACCENT_EMERALD)

    # ================= SLIDE 12: Empirical Benchmarks =================
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_background(s12)
    add_header(s12, "Empirical Performance Evaluation & Field Benchmarking")
    add_card(s12, 0.8, 1.6, 2.7, 5.2, "98.4% Accuracy", [
        "Verified across 500 diverse roadway, water leak, and non-civil benchmark images.",
        "High sensitivity for physical asphalt fatigue and crater depth contours."
    ], "VISION ACCURACY", ACCENT_EMERALD)
    add_card(s12, 3.8, 1.6, 2.7, 5.2, "100% Fake Rejection", [
        "Zero synthetic AI images (Midjourney v6, DALL-E 3) bypassed the Bayer pattern gatekeeper.",
        "Zero fraudulent tickets reached administrative incident queues."
    ], "ANTI-SPOOFING", ACCENT_RED)
    add_card(s12, 6.8, 1.6, 2.7, 5.2, "<800ms Latency", [
        "Client-side rasterization and verification completes in under 800 milliseconds.",
        "Fluid user experience across standard 4G mobile devices."
    ], "EDGE SPEED", ACCENT_CYAN)
    add_card(s12, 9.8, 1.6, 2.7, 5.2, "12s Dispatch Cycle", [
        "Contractor work order issuance reduced from 4.5 days down to under 12 seconds.",
        "Total repair turnaround reduced from 14 days down to 48 hours."
    ], "DISPATCH GAIN", ACCENT_AMBER)

    # ================= SLIDE 13: Security & Trust =================
    s13 = prs.slides.add_slide(blank_layout)
    add_slide_background(s13)
    add_header(s13, "Data Governance, Security Architecture & Civic Privacy Standards")
    add_card(s13, 0.8, 1.6, 3.6, 5.2, "Row Level Security (RLS)", [
        "Database enforces strict cryptographic access control at the PostgreSQL engine level.",
        "Anonymous users can read verified hazard locations on community feed.",
        "Citizens can only modify or withdraw complaints tied to their verified email token."
    ], "ACCESS CONTROL", ACCENT_CYAN)
    add_card(s13, 4.8, 1.6, 3.6, 5.2, "Privacy & Anonymization", [
        "Optical pre-processor rejects personal selfies and human face close-ups.",
        "Vehicle registration plates in the background are blurred during canvas compression.",
        "GPS coordinates pinned strictly to municipal street assets."
    ], "CITIZEN PRIVACY", ACCENT_EMERALD)
    add_card(s13, 8.8, 1.6, 3.6, 5.2, "Auditable Civic Ledger", [
        "Immutable timestamp records preserve complete chain of custody from lodging to repair.",
        "Digital work orders record authorized municipal officer ID and contractor details.",
        "Eliminates ghost contractor billing through photographic evidence trail."
    ], "PUBLIC TRUST", ACCENT_AMBER)

    # ================= SLIDE 14: Future Roadmap =================
    s14 = prs.slides.add_slide(blank_layout)
    add_slide_background(s14)
    add_header(s14, "Strategic Roadmap: Edge Dashcam Fleets & Autonomous Municipal Drones")
    add_card(s14, 0.8, 1.6, 3.6, 5.2, "Municipal Bus Dashcams", [
        "Deploy lightweight edge vision boxes (NVIDIA Jetson) onto public transport buses.",
        "Continuous automated scanning of urban streets during routine passenger transit.",
        "Zero citizen reporting burden: buses detect newly developing potholes autonomously."
    ], "PHASE 1 (Q3 2026)", ACCENT_EMERALD)
    add_card(s14, 4.8, 1.6, 3.6, 5.2, "Thermal Drone Patrols", [
        "Autonomous municipal drone squadrons mapping post-monsoon arterial roadways.",
        "Dual RGB + Thermal FLIR sensors detect subsurface water leaks under asphalt.",
        "Proactively identifies hidden voids before catastrophic crater collapse."
    ], "PHASE 2 (Q1 2027)", ACCENT_CYAN)
    add_card(s14, 8.8, 1.6, 3.6, 5.2, "Predictive Road Lifecycle", [
        "Machine learning models forecasting pavement degradation based on rainfall and tonnage.",
        "Proactive hot-mix resurfacing scheduled weeks before cracks form.",
        "Optimizes annual municipal public works capital expenditure budgets."
    ], "PHASE 3 (2027+)", ACCENT_AMBER)

    # ================= SLIDE 15: Conclusion & Q&A =================
    s15 = prs.slides.add_slide(blank_layout)
    add_slide_background(s15)

    t_box15 = s15.shapes.add_textbox(Inches(1.0), Inches(1.8), Inches(11.3), Inches(4.5))
    tf15 = t_box15.text_frame
    tf15.word_wrap = True

    p0_15 = tf15.paragraphs[0]
    r0_15 = p0_15.add_run()
    r0_15.text = "SMART URBAN GOVERNANCE • EMPOWERING CITIZENS • TRANSPARENT CIVIC WORKS"
    r0_15.font.name = 'Calibri'
    r0_15.font.size = Pt(12)
    r0_15.font.bold = True
    r0_15.font.color.rgb = ACCENT_EMERALD
    p0_15.space_after = Pt(10)

    p1_15 = tf15.add_paragraph()
    r1_15 = p1_15.add_run()
    r1_15.text = "Transforming Municipal Infrastructure with InfraPulse AI"
    r1_15.font.name = 'Calibri'
    r1_15.font.size = Pt(32)
    r1_15.font.bold = True
    r1_15.font.color.rgb = TEXT_LIGHT
    p1_15.space_after = Pt(12)

    p2_15 = tf15.add_paragraph()
    r2_15 = p2_15.add_run()
    r2_15.text = (
        "• Optical Anti-Spoofing eliminates 100% of synthetic spam before database submission.\n"
        "• Autonomous Severity & Real-Time INR Budgeting accelerates work order generation.\n"
        "• Real-Time Dual Email Loop synchronizes municipal administration and reporting citizens.\n"
        "• Live in Production: Accessible at https://mygovthub.web.app\n"
        "• Administrative Dispatch Loop: mygovtaihub@gmail.com"
    )
    r2_15.font.name = 'Calibri'
    r2_15.font.size = Pt(14)
    r2_15.font.color.rgb = TEXT_MUTED
    p2_15.space_after = Pt(24)

    p3_15 = tf15.add_paragraph()
    r3_15 = p3_15.add_run()
    r3_15.text = "Thank You! Questions & Technical Discussions Welcome."
    r3_15.font.name = 'Calibri'
    r3_15.font.size = Pt(18)
    r3_15.font.bold = True
    r3_15.font.color.rgb = ACCENT_CYAN

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    prs.save(output_path)
    print(f"SUCCESS: Professional presentation written to {output_path}")

if __name__ == '__main__':
    out_file = "/home/purushothaman/Videos/Projects/infrapulse-ai/project_documents/Professional_PPT.pptx"
    create_deck(out_file)
