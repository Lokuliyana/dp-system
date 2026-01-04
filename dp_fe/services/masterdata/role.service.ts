import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Role } from "@/types/models"

export const roleService = {
  list() {
    return axiosInstance.get(endpoints.auth.roles)
      .then(r => r.data.data as Role[])
  },
  create(payload: any) {
    return axiosInstance.post(endpoints.auth.roles, payload)
      .then(r => r.data.data as Role)
  },
  update(id: string, payload: any) {
    return axiosInstance.patch(`${endpoints.auth.roles}/${id}`, payload)
      .then(r => r.data.data as Role)
  },
  delete(id: string) {
    return axiosInstance.delete(`${endpoints.auth.roles}/${id}`)
  }
}
