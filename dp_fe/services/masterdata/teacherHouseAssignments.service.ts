import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"

export type AssignTeacherHousePayload = {
  teacherId: string
  houseId: string
  assignedDate?: string
}

export const teacherHouseAssignmentsService = {
  assign(payload: AssignTeacherHousePayload) {
    return axiosInstance
      .post(endpoints.teacherHouseAssignments, payload)
      .then((r) => r.data.data)
  },

  list(filters?: { teacherId?: string; houseId?: string }) {
    return axiosInstance
      .get(endpoints.teacherHouseAssignments, { params: filters })
      .then((r) => r.data.data as any[])
  },
}
