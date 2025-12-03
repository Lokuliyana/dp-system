import type { House } from "./types"

export const HOUSES: { value: House; label: string; color: string; bgColor: string }[] = [
  { value: "meththa", label: "Meththa", color: "text-red-600", bgColor: "bg-red-50" },
  { value: "karuna", label: "Karuna", color: "text-blue-600", bgColor: "bg-blue-50" },
  { value: "muditha", label: "Muditha", color: "text-green-600", bgColor: "bg-green-50" },
  { value: "upekka", label: "Upekka", color: "text-yellow-600", bgColor: "bg-yellow-50" },
]

export function getHouseLabel(house: House): string {
  return HOUSES.find((h) => h.value === house)?.label || house
}

export function getHouseColor(house: House): string {
  return HOUSES.find((h) => h.value === house)?.color || "text-slate-600"
}

export function getHouseBgColor(house: House): string {
  return HOUSES.find((h) => h.value === house)?.bgColor || "bg-slate-50"
}
