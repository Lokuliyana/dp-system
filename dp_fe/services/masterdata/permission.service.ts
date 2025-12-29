import { axiosInstance } from "@/lib/axios"
import { endpoints } from "@/lib/endpoints"
import type { ApiResponse } from "@/types/models"

export type PermissionGroup = Record<string, string>
export type PermissionMap = Record<string, PermissionGroup>

export const permissionService = {
  listPermissions() {
    return axiosInstance
      .get(endpoints.permissions)
      .then(r => r.data.data)
  },
}
