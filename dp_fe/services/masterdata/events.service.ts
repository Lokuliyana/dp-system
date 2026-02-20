import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Event, EventRegistration, EventCategory } from "@/types/models"

export type CreateEventPayload = {
  nameSi: string
  nameEn: string
  descriptionSi?: string
  descriptionEn?: string
  eventType: EventCategory
  date: string
  endDate?: string
  gradeIds?: string[]
  teacherInChargeId?: string
  clubId?: string
  squadId?: string
  year: number
}

export type RegisterEventPayload = {
  eventId: string
  studentId: string
  gradeId: string
  year: number
  noteEn?: string
}

export const eventsService = {
  create(payload: CreateEventPayload) {
    return axiosInstance.post(endpoints.events, payload)
      .then(r => r.data.data as Event)
  },

  list(year?: number) {
    return axiosInstance.get(endpoints.events, { params: { year } })
      .then(r => r.data.data as Event[])
  },

  update(id: string, payload: Partial<CreateEventPayload>) {
    return axiosInstance.patch(`${endpoints.events}/${id}`, payload)
      .then(r => r.data.data as Event)
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.events}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },

  registerStudent(payload: RegisterEventPayload) {
    return axiosInstance.post(`${endpoints.events}/register`, payload)
      .then(r => r.data.data as EventRegistration)
  },

  bulkRegisterStudents(eventId: string, payload: { studentIds: string[]; gradeId: string; year: number; noteEn?: string }) {
    return axiosInstance.post(`${endpoints.events}/${eventId}/registrations/bulk`, payload)
      .then(r => r.data.data as EventRegistration[])
  },

  listRegistrations(filters?: { eventId?: string; studentId?: string; year?: number }) {
    return axiosInstance.get(`${endpoints.events}/registrations`, { params: filters })
      .then(r => r.data.data as EventRegistration[])
  },

  removeRegistration(id: string) {
    return axiosInstance.delete(`${endpoints.events}/registrations/${id}`)
      .then(r => r.data.data as { deleted: true })
  },
}
