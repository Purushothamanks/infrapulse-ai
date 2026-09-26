import { HazardReport, CityWardStat } from '@/types/hazard';

export const initialHazards: HazardReport[] = [];

export const cityWardStats: CityWardStat[] = [
  { wardId: 'W-04', name: 'East Tech Corridor', openHazards: 14, resolvedHazards: 48, greenScore: 78, averageFixHours: 4.2 },
  { wardId: 'W-07', name: 'South Central', openHazards: 8, resolvedHazards: 62, greenScore: 84, averageFixHours: 3.1 },
  { wardId: 'W-02', name: 'West Industrial', openHazards: 22, resolvedHazards: 35, greenScore: 61, averageFixHours: 7.8 },
  { wardId: 'W-09', name: 'North Ecological Reserve', openHazards: 5, resolvedHazards: 51, greenScore: 92, averageFixHours: 2.8 },
  { wardId: 'W-05', name: 'South Hub', openHazards: 11, resolvedHazards: 43, greenScore: 73, averageFixHours: 4.9 },
  { wardId: 'W-11', name: 'East Suburbs', openHazards: 7, resolvedHazards: 39, greenScore: 81, averageFixHours: 5.5 }
];
