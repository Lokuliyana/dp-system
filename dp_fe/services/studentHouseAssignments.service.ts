import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { StudentHouseAssignment } from "@/types/models"

export type AssignStudentHousePayload = {
  studentId: string
  gradeId: string
  houseId: string
  year: number
  assignedDate?: string
}

export const studentHouseAssignmentsService = {
  assign(payload: AssignStudentHousePayload) {
    return axiosInstance.post(endpoints.studentHouseAssignments, payload)
      .then(r => r.data.data as StudentHouseAssignment)
  },

  remove(studentId: string, year: number) {
    return axiosInstance.delete(`${endpoints.studentHouseAssignments}/${studentId}`, {
      params: { year },
    }).then(r => r.data)
  },

  bulkAssign(payload: { assignments: { studentId: string; houseId: string | null; gradeId?: string }[]; year: number }) {
    return axiosInstance.post(`${endpoints.studentHouseAssignments}/bulk`, payload)
      .then(r => r.data)
  },

  list(filters?: { studentId?: string; gradeId?: string; houseId?: string; year?: number }) {
    return axiosInstance.get(endpoints.studentHouseAssignments, {
      params: filters,
    }).then(r => r.data.data as StudentHouseAssignment[])
  },
}
