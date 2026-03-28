import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";

export interface AttendanceConfig {
  allowedDayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const schoolService = {
  getAttendanceConfig: async (): Promise<AttendanceConfig> => {
    const response = await axiosInstance.get(endpoints.schools.config);
    return response.data.data;
  },

  updateAttendanceConfig: async (config: AttendanceConfig): Promise<AttendanceConfig> => {
    const response = await axiosInstance.patch(endpoints.schools.config, config);
    return response.data.data;
  },
};
