import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Prefect } from "@/types/models"

export type CreatePrefectYearPayload = {
  year: number
  appointedDate?: Date
}

export type AddPrefectStudentPayload = {
  studentId: string
  studentNameSi?: string
  studentNameEn?: string
  rank: "head-prefect" | "deputy-head-prefect" | "senior-prefect" | "junior-prefect" | "primary-prefect"
  positionIds?: string[]
}

export const prefectsService = {
  createYear(payload: CreatePrefectYearPayload) {
    return axiosInstance.post(endpoints.prefects, payload)
      .then(r => r.data.data)
  },

  list(year?: number) {
    return axiosInstance.get(endpoints.prefects, { params: { year } })
      .then(r => r.data.data as any[])
  },

  addStudent(yearId: string, payload: AddPrefectStudentPayload) {
    return axiosInstance.post(`${endpoints.prefects}/${yearId}/students`, payload)
      .then(r => r.data.data)
  },

  updateStudent(yearId: string, studentId: string, payload: Partial<AddPrefectStudentPayload>) {
    return axiosInstance.patch(`${endpoints.prefects}/${yearId}/students/${studentId}`, payload)
      .then(r => r.data.data)
  },

  removeStudent(yearId: string, studentId: string) {
    return axiosInstance.delete(`${endpoints.prefects}/${yearId}/students/${studentId}`)
      .then(r => r.data.data as { deleted: true })
  },
}
