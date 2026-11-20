import { HFA_BOYS, HFA_GIRLS, WFA_BOYS, WFA_GIRLS } from '@/lib/who-growth'

export type Sex = 'L' | 'P'

export type GrowthStatus = 
  | 'normal' 
  | 'stunting' 
  | 'severely_stunting'
  | 'underweight'
  | 'severely_underweight'
  | 'wasting'
  | 'severely_wasting'

export interface ZScoreResult {
  z_hfa: number
  z_wfa: number
  status_hfa: GrowthStatus
  status_wfa: GrowthStatus
}

function findLMS(table: readonly (readonly [number, number, number, number])[], ageMonths: number) {
  // Find exact age or interpolate between nearest
  let entry = table.find(e => e[0] === ageMonths)
  if (entry) return entry
  
  // Interpolate
  const lower = table.filter(e => e[0] < ageMonths).pop()
  const upper = table.find(e => e[0] > ageMonths)
  if (!lower) return table[0]
  if (!upper) return table[table.length - 1]
  
  const t = (ageMonths - lower[0]) / (upper[0] - lower[0])
  return [
    ageMonths,
    lower[1] + t * (upper[1] - lower[1]),
    lower[2] + t * (upper[2] - lower[2]),
    lower[3] + t * (upper[3] - lower[3]),
  ] as [number, number, number, number]
}

function calcZScore(measurement: number, L: number, M: number, S: number): number {
  if (L === 1) {
    return (measurement - M) / (M * S)
  }
  return (Math.pow(measurement / M, L) - 1) / (L * S)
}

function classifyHFA(z: number): GrowthStatus {
  if (z < -3) return 'severely_stunting'
  if (z < -2) return 'stunting'
  return 'normal'
}

function classifyWFA(z: number): GrowthStatus {
  if (z < -3) return 'severely_underweight'
  if (z < -2) return 'underweight'
  return 'normal'
}

export function calculateGrowthStatus(
  sex: Sex,
  ageMonths: number,
  heightCm: number,
  weightKg: number
): ZScoreResult {
  const hfaTable = sex === 'L' ? HFA_BOYS : HFA_GIRLS
  const wfaTable = sex === 'L' ? WFA_BOYS : WFA_GIRLS
  
  const [, hL, hM, hS] = findLMS(hfaTable, ageMonths)
  const [, wL, wM, wS] = findLMS(wfaTable, ageMonths)
  
  const z_hfa = calcZScore(heightCm, hL, hM, hS)
  const z_wfa = calcZScore(weightKg, wL, wM, wS)
  
  return {
    z_hfa: Math.round(z_hfa * 100) / 100,
    z_wfa: Math.round(z_wfa * 100) / 100,
    status_hfa: classifyHFA(z_hfa),
    status_wfa: classifyWFA(z_wfa),
  }
}

export function getStatusLabel(status: GrowthStatus): string {
  const labels: Record<GrowthStatus, string> = {
    normal: 'Normal',
    stunting: 'Stunting (Pendek)',
    severely_stunting: 'Stunting Parah (Sangat Pendek)',
    underweight: 'Berat Badan Kurang',
    severely_underweight: 'Berat Badan Sangat Kurang',
    wasting: 'Wasting (Kurus)',
    severely_wasting: 'Wasting Parah (Sangat Kurus)',
  }
  return labels[status]
}

export function getStatusColor(status: GrowthStatus): string {
  const colors: Record<GrowthStatus, string> = {
    normal: 'green',
    stunting: 'orange',
    severely_stunting: 'red',
    underweight: 'orange',
    severely_underweight: 'red',
    wasting: 'orange',
    severely_wasting: 'red',
  }
  return colors[status]
}