import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";

export type DashboardData = {
  studentCount: number;
  staffCount: number;
  competitionCount: number;
  attendanceAvg: number;
  gradePerformance: Array<{
    gradeId: string;
    gradeNameEn: string;
    gradeNameSi: string;
    level: number;
    sectionId: string | null;
    avgAttendance: number;
    avgMark: number;
  }>;
  sections: Array<{
    id: string;
    nameEn: string;
    nameSi: string;
    gradeIds: string[];
  }>;
  housePoints: Array<{
    houseId: string;
    points: number;
    houseName?: string;
  }>;
  upcomingEvents: any[];
  specialDays: any[];
};

export const dashboardService = {
  getDashboardData() {
    return axiosInstance
      .get(endpoints.dashboard)
      .then((r) => r.data.data as DashboardData);
  },
};
