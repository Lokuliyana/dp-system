import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { attendanceService } from "@/services/masterdata/attendance.service"
import { qk } from "@/lib/queryKeys"

export function useAttendanceByDate(date: string, gradeId?: string) {
  return useQuery({
    queryKey: qk.attendance.byDate(date, gradeId),
    queryFn: () => attendanceService.listByDate(date, gradeId),
    enabled: !!date,
  })
}

export function useAttendanceByStudent(studentId: string, startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: qk.attendance.byStudent(studentId),
    queryFn: () => attendanceService.listByStudent(studentId, startDate, endDate),
    enabled: !!studentId,
  })
}

export function useMarkAttendance(date: string, gradeId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: attendanceService.mark,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.attendance.byDate(date, gradeId) })
    },
  })
}

export function useUpdateAttendance(date: string, gradeId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "present" | "absent" | "late" }) =>
      attendanceService.update(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.attendance.byDate(date, gradeId) })
    },
  })
}

export function useDeleteAttendance(date: string, gradeId?: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => attendanceService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.attendance.byDate(date, gradeId) })
    },
  })
}
