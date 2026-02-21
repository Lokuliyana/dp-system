import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";

export interface AnalyticsDistribution {
  best: number;
  good: number;
  normal: number;
  weak: number;
}

export interface StudentAnalytics {
  studentId: string;
  year: number;
  metrics: {
    attendancePct: number;
    markAvg: number;
    attendanceCount: number;
    presentCount: number;
    examCount: number;
  };
  category: "best" | "good" | "normal" | "weak";
}

export interface GradeAnalytics {
  gradeId: string;
  year: number;
  studentCount: number;
  distribution: AnalyticsDistribution;
  averages: {
    attendancePct: number;
    markAvg: number;
  };
  studentDetails?: StudentAnalytics[];
}

export interface OrganizationAnalytics {
  year: number;
  totalStudents: number;
  distribution: AnalyticsDistribution;
  averages: {
    attendancePct: number;
    markAvg: number;
  };
  gradeWise: Array<{
    gradeId: string;
    gradeName: string;
    studentCount: number;
    distribution: AnalyticsDistribution;
    averages: {
      attendancePct: number;
      markAvg: number;
    };
  }>;
}

export const analyticsService = {
  getStudent(id: string, year?: number) {
    return axiosInstance
      .get(`${endpoints.analytics.student}/${id}`, { params: { year } })
      .then((r) => r.data.data as StudentAnalytics);
  },

  getGrade(id: string, year?: number) {
    return axiosInstance
      .get(`${endpoints.analytics.grade}/${id}`, { params: { year } })
      .then((r) => r.data.data as GradeAnalytics);
  },

  getOrganization(year?: number) {
    return axiosInstance
      .get(endpoints.analytics.organization, { params: { year } })
      .then((r) => r.data.data as OrganizationAnalytics);
  },
};
