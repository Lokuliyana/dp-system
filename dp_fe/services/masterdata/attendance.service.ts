import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Attendance } from "@/types/models"

export type MarkAttendancePayload = {
  date: string
  studentId: string
  gradeId: string
  status: "present" | "absent" | "late"
}

export const attendanceService = {
  mark(payload: MarkAttendancePayload) {
    return axiosInstance.post(endpoints.attendance.base, payload)
      .then(r => r.data.data as Attendance)
  },

  update(id: string, status: MarkAttendancePayload["status"]) {
    return axiosInstance.patch(`${endpoints.attendance.base}/${id}`, { status })
      .then(r => r.data.data as Attendance)
  },

  listByDate(date: string, gradeId?: string) {
    return axiosInstance.get(`${endpoints.attendance.base}/by-date`, {
      params: { date, gradeId },
    }).then(r => r.data.data as Attendance[])
  },

  listByStudent(studentId: string, startDate?: string, endDate?: string) {
    return axiosInstance.get(`${endpoints.attendance.base}/by-student/${studentId}`, {
      params: { startDate, endDate },
    }).then(r => r.data.data as Attendance[])
  },

  remove(id: string) {
    return axiosInstance.delete(`${endpoints.attendance.base}/${id}`)
      .then(r => r.data.data as { deleted: true })
  },

  getStats(startDate: string, endDate: string, gradeId?: string) {
    return axiosInstance.get(`${endpoints.attendance.base}/stats`, {
      params: { startDate, endDate, gradeId },
    }).then(r => r.data.data as {
      date: string
      gradeId: string
      present: number
      absent: number
      late: number
      total: number
    }[])
  },

  getDashboardStats(startDate: string, endDate: string) {
    return axiosInstance.get(endpoints.attendance.dashboardStats, {
      params: { startDate, endDate },
    }).then(r => r.data.data as {
      dailyTrend: any[]
      gradeStats: any[]
      interventionList: any[]
      summary: any
    })
  },

  listByRange(startDate: string, endDate: string, gradeId?: string) {
    return axiosInstance.get(`${endpoints.attendance.base}/by-range`, {
      params: { startDate, endDate, gradeId },
    }).then(r => r.data.data as Attendance[])
  },
}
