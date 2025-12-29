import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { Role } from "@/types/models"

export const roleService = {
  list() {
    return axiosInstance.get(endpoints.auth.roles)
      .then(r => r.data.data as Role[])
  },
}
