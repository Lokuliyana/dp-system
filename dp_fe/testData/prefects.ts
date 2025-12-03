import type { PrefectResponsibility } from "./types"

export const SAMPLE_PREFECT_RESPONSIBILITIES: PrefectResponsibility[] = [
  {
    id: "presp-1",
    title: "Roll Call During Assembly",
    description: "Take attendance during assembly",
    createdDate: new Date().toISOString().split("T")[0],
    category: "attendance",
  },
  {
    id: "presp-2",
    title: "Classroom Cleanliness",
    description: "Ensure classroom is clean and organized",
    createdDate: new Date().toISOString().split("T")[0],
    category: "cleanliness",
  },
  {
    id: "presp-3",
    title: "Behavior Monitoring",
    description: "Monitor student behavior during breaks and classes",
    createdDate: new Date().toISOString().split("T")[0],
    category: "conduct",
  },
  {
    id: "presp-4",
    title: "Class Event Organization",
    description: "Help organize class events and activities",
    createdDate: new Date().toISOString().split("T")[0],
    category: "co-curricular",
  },
]
