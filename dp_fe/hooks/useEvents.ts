import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { eventsService } from "@/services/masterdata/events.service"
import { qk } from "@/lib/queryKeys"

export function useEvents(year?: number) {
  return useQuery({
    queryKey: qk.events.byYear(year),
    queryFn: () => eventsService.list(year),
    staleTime: 60_000,
  })
}

export function useCreateEvent(year?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.byYear(year) })
    },
  })
}

export function useUpdateEvent(year?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      eventsService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.byYear(year) })
    },
  })
}

export function useDeleteEvent(year?: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventsService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.events.byYear(year) })
    },
  })
}

export function useRegisterEventStudent(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: eventsService.registerStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.eventRegistrations.byEvent(eventId) })
    },
  })
}

export function useBulkRegisterEventStudents(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: { studentIds: string[]; gradeId: string; year: number; noteEn?: string }) => 
      eventsService.bulkRegisterStudents(eventId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.eventRegistrations.byEvent(eventId) })
    },
  })
}

export function useEventRegistrations(eventId: string) {
  return useQuery({
    queryKey: qk.eventRegistrations.byEvent(eventId),
    queryFn: () => eventsService.listRegistrations({ eventId }),
    enabled: !!eventId,
  })
}

export function useRemoveEventRegistration(eventId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (regId: string) => eventsService.removeRegistration(regId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.eventRegistrations.byEvent(eventId) })
    },
  })
}
