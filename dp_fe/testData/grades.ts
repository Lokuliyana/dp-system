import type { Grade } from "./types"

export const GRADES: Grade[] = Array.from({ length: 13 }, (_, i) => ({
  id: `grade-${i + 1}`,
  name: `Grade ${i + 1}`,
  level: i + 1,
  section: "A",
  totalStrength: 35 + Math.floor(Math.random() * 10),
  classTeacher: `Teacher ${String.fromCharCode(65 + (i % 5))}`,
}))
