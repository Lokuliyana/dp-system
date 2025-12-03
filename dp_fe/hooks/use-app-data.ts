"use client"

import { useState, useEffect } from "react"
import {
  GRADES,
  generateStudents,
  generateAttendanceRecords,
  generateStudentMarks,
  SAMPLE_TEACHERS,
  SAMPLE_TEACHER_RESPONSIBILITIES,
  SAMPLE_PREFECT_RESPONSIBILITIES,
  SAMPLE_CLUBS,
  type Grade,
  type Student,
  type AttendanceRecord,
  type StudentMarks,
  type Teacher,
  type TeacherResponsibility,
  type PrefectResponsibility,
  type Club,
} from "@/testData"

interface AppData {
  grades: Grade[]
  students: Student[]
  attendanceRecords: AttendanceRecord[]
  marks: StudentMarks[]
  teachers: Teacher[]
  teacherResponsibilities: TeacherResponsibility[]
  prefectResponsibilities: PrefectResponsibility[]
  clubs: Club[]
  isLoading: boolean
  error: string | null
}

export function useAppData(): AppData {
  const [data, setData] = useState<AppData>({
    grades: [],
    students: [],
    attendanceRecords: [],
    marks: [],
    teachers: [],
    teacherResponsibilities: [],
    prefectResponsibilities: [],
    clubs: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    try {
      const appData: AppData = {
        grades: GRADES,
        students: generateStudents(),
        attendanceRecords: generateAttendanceRecords(),
        marks: generateStudentMarks(),
        teachers: SAMPLE_TEACHERS,
        teacherResponsibilities: SAMPLE_TEACHER_RESPONSIBILITIES,
        prefectResponsibilities: SAMPLE_PREFECT_RESPONSIBILITIES,
        clubs: SAMPLE_CLUBS,
        isLoading: false,
        error: null,
      }

      setData(appData)
    } catch (error) {
      console.error("[v0] Error loading app data:", error)
      setData((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to load data",
      }))
    }
  }, [])

  return data
}
