import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Club } from "@/types/models"

export type CreateClubPayload = {
  nameSi: string
  nameEn: string
  descriptionSi?: string
  descriptionEn?: string
  teacherInChargeId: string
  year: number
}

export type UpdateClubPayload = Partial<CreateClubPayload>

export type AssignClubMemberPayload = {
  studentId: string
  positionId?: string | null
}

export const clubsService = {
  create(payload: CreateClubPayload) {
    return axiosInstance.post(endpoints.clubs, payload)
      .then(r => r.data.data as Club)
  },

  list() {
    return axiosInstance.get(endpoints.clubs)
      .then(r => r.data.data as Club[])
  },

  update(id: string, payload: UpdateClubPayload) {
    return axiosInstance.patch(`${endpoints.clubs}/${id}`, payload)
      .then(r => r.data.data as Club)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.clubs}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },

  assignMember(clubId: string, payload: AssignClubMemberPayload) {
    return axiosInstance.post(`${endpoints.clubs}/${clubId}/assign`, payload)
      .then(r => r.data.data as Club)
  },

  bulkAssignMember(clubId: string, assignments: { studentId: string; positionId?: string | null }[]) {
    return axiosInstance.post(`${endpoints.clubs}/${clubId}/members/bulk`, { assignments })
      .then(r => r.data.data as Club)
  },

  removeMember(clubId: string, studentId: string) {
    return axiosInstance.delete(`${endpoints.clubs}/${clubId}/members/${studentId}`)
      .then(r => r.data.data as Club)
  },
}
