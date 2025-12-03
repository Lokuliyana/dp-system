import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { ExamResult } from "@/types/models"

export type CreateExamSheetPayload = {
  gradeId: string
  term: 1 | 2 | 3
  year: number
  gradingSchemaId: string
}

export type UpsertExamResultsPayload = {
  sheetId: string
  results: Array<{ studentId: string; marks: number }>
}

export const examResultsService = {
  createSheet(payload: CreateExamSheetPayload) {
    return axiosInstance.post(`${endpoints.examResults}/sheet`, payload)
      .then(r => r.data.data as ExamResult)
  },

  upsertResults(payload: UpsertExamResultsPayload) {
    return axiosInstance.put(endpoints.examResults, payload)
      .then(r => r.data.data as ExamResult)
  },

  listByStudent(studentId: string) {
    return axiosInstance.get(`${endpoints.examResults}/student/${studentId}`)
      .then(r => r.data.data as ExamResult[])
  },

  listByGrade(gradeId: string) {
    return axiosInstance.get(`${endpoints.examResults}/grade/${gradeId}`)
      .then(r => r.data.data as ExamResult[])
  },
}
