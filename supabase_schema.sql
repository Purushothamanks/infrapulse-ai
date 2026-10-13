-- ============================================================
-- InfraPulse AI / MyGovt AI Hub — Supabase Realtime Setup SQL
-- Paste this script into your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ============================================================

-- 1. Create the hazards table
create table if not exists public.hazards (
  id text primary key,
  title text not null,
  type text not null,
  severity integer not null,
  urgency text not null,
  status text not null default 'NOT_STARTED',
  location jsonb not null,
  image_url text,
  reported_at text default 'Just now',
  citizen_name text,
  citizen_email text,
  upvotes integer default 1,
  ai_analysis jsonb,
  work_order jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Realtime Replication on the table
alter publication supabase_realtime add table public.hazards;

-- 3. Enable Row Level Security (RLS) with full public access policies
alter table public.hazards enable row level security;

drop policy if exists "Allow public select" on public.hazards;
create policy "Allow public select" on public.hazards for select using (true);

drop policy if exists "Allow public insert" on public.hazards;
create policy "Allow public insert" on public.hazards for insert with check (true);

drop policy if exists "Allow public update" on public.hazards;
create policy "Allow public update" on public.hazards for update using (true);

drop policy if exists "Allow public delete" on public.hazards;
create policy "Allow public delete" on public.hazards for delete using (true);

-- 4. Initial Seed Mock Hazards
insert into public.hazards (id, title, type, severity, urgency, status, location, image_url, reported_at, citizen_name, citizen_email, upvotes, ai_analysis, work_order)
values
(
  'HZ-2026-8419',
  'Deep Structural Asphalt Cavity & Crater',
  'pothole',
  88,
  'CRITICAL',
  'DISPATCHED',
  '{"lat": 12.9716, "lng": 77.5946, "x": 480, "y": 380, "address": "Outer Ring Road, Near Tech Corridor", "ward": "Ward 4 - East Tech Corridor"}'::jsonb,
  '/sample-hazards/1_severe_pothole_crater.png',
  '12 mins ago',
  'Arjun Verma',
  'arjun.verma@gmail.com',
  7,
  '{"confidence": 97.4, "hazardType": "pothole", "hazardLabel": "Deep Structural Asphalt Cavity & Crater", "detectedFeatures": ["Severe sub-base erosion", "Asphalt rim shear fracture", "Vehicle axle hazard"], "dimensionsEstimated": "1.8m dia × 14cm depth", "severityScore": 88, "urgencyLevel": "CRITICAL", "sustainabilityImpact": "Vehicular micro-congestion increases localized exhaust emissions by ~38 kg CO2e/day.", "suggestedAction": "Deploy municipal cold-mix bitumen crew immediately.", "carbonPenaltyKgPerDay": 38.6, "estimatedCost": 29640, "isDuplicate": false}'::jsonb,
  '{"orderId": "WO-MUN-8419", "contractorTeam": "City Rapid Pavement Logistics Div-2", "contactNumber": "+91 80 2297 5000", "priorityLevel": "CRITICAL", "scheduledDispatch": "IMMEDIATE DISPATCH (T-30 MINS)", "estimatedRepairHours": 5.5, "requiredMaterials": ["Polymer Cold Asphalt 300kg", "Bitumen Emulsion RS-1", "Road Warning Barricades"], "estimatedBudget": 29640, "co2MitigationImpact": "Mitigates 75 kg CO2 equivalent and prevents civic disruption.", "status": "DISPATCHED"}'::jsonb
),
(
  'HZ-2026-9302',
  'Municipal Pressurized Water Pipe Rupture',
  'water_leak',
  95,
  'CRITICAL',
  'NOT_STARTED',
  '{"lat": 12.9832, "lng": 80.2315, "x": 520, "y": 420, "address": "80 Feet Road, 4th Block Urban Sector", "ward": "Ward 7 - South Central"}'::jsonb,
  '/sample-hazards/2_water_main_rupture.png',
  '25 mins ago',
  'Civilian Citizen',
  'citizen@gmail.com',
  12,
  '{"confidence": 98.9, "hazardType": "water_leak", "hazardLabel": "Municipal Pressurized Water Pipe Rupture", "detectedFeatures": ["Pressurized water plume detected", "Sub-surface soil erosion under asphalt", "Potable drinking water wastage"], "dimensionsEstimated": "Discharge estimate: ~380 Liters/minute", "severityScore": 95, "urgencyLevel": "CRITICAL", "sustainabilityImpact": "Depletes municipal freshwater reserves; risks roadway collapse via sinkhole formation.", "suggestedAction": "Remotely isolate valve feeder line; deploy hydraulic clamp crew.", "carbonPenaltyKgPerDay": 75.0, "estimatedCost": 42000, "isDuplicate": false}'::jsonb,
  null
),
(
  'HZ-2026-9188',
  'Reinforced Concrete Structural Shear Crack',
  'structural_crack',
  84,
  'HIGH',
  'NOT_STARTED',
  '{"lat": 12.9645, "lng": 80.2189, "x": 430, "y": 490, "address": "Pillar #42, Metro Expressway", "ward": "Ward 2 - West Industrial"}'::jsonb,
  '/sample-hazards/3_structural_flyover_crack.png',
  '1 hour ago',
  'Arjun Verma',
  'arjun.verma@gmail.com',
  4,
  '{"confidence": 93.8, "hazardType": "structural_crack", "hazardLabel": "Reinforced Concrete Structural Shear Crack", "detectedFeatures": ["Diagonal shear fissure pattern", "Concrete spalling along load axis", "Structural vibration vulnerability"], "dimensionsEstimated": "2.4m length × 3.8mm aperture", "severityScore": 84, "urgencyLevel": "HIGH", "sustainabilityImpact": "Premature bridge deterioration requiring carbon-heavy replacement if left unattended.", "suggestedAction": "Epoxy resin pressure injection and continuous strain gauge sensor installation.", "carbonPenaltyKgPerDay": 12.0, "estimatedCost": 65000, "isDuplicate": false}'::jsonb,
  null
)
on conflict (id) do nothing;
