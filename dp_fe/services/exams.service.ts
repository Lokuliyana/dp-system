import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"

export type CreateExamPayload = {
  nameSi: string
  nameEn: string
  date: string | Date
  type: 'SRIANANDA' | 'DEPARTMENT'
  gradeIds: string[]
  year: number
}

export type UpdateMarksPayload = {
  marks: Array<{
    studentId: string
    gradeId: string
    mark?: number
    isPresent?: boolean
    comment?: string
  }>
}

export const examsService = {
  list(params?: { year?: number; gradeId?: string }) {
    return axiosInstance.get(endpoints.exams, { params })
      .then(r => r.data.data)
  },

  create(payload: CreateExamPayload) {
    return axiosInstance.post(endpoints.exams, payload)
      .then(r => r.data.data)
  },

  getMarks(examId: string, gradeId: string) {
    return axiosInstance.get(`${endpoints.exams}/${examId}/marks`, { params: { gradeId } })
      .then(r => r.data.data)
  },

  updateMarks(examId: string, payload: UpdateMarksPayload) {
    return axiosInstance.post(`${endpoints.exams}/${examId}/marks`, payload)
      .then(r => r.data.data)
  },

  getStudentHistory(studentId: string) {
    return axiosInstance.get(`${endpoints.exams}/student/${studentId}/history`)
      .then(r => r.data.data)
  }
}
