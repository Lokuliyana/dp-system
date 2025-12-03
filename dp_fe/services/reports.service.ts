import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";

export type StudentReport = {
  student: any; // Replace with proper type
  attendance: {
    total: number;
    present: number;
    percentage: string;
  };
  examResults: any[];
};

export type GradeReport = {
  grade: any;
  studentCount: number;
};

export type TeacherReport = {
  teacher: any;
};

export type HouseReport = {
  house: any;
};

export type TeamsReport = {
  zonal: any[];
  district: any[];
  allisland: any[];
};

export const reportsService = {
  getStudentReport(id: string) {
    return axiosInstance
      .get(`${endpoints.reports.student}/${id}`)
      .then((r) => r.data.data as StudentReport);
  },

  getGradeReport(id: string) {
    return axiosInstance
      .get(`${endpoints.reports.grade}/${id}`)
      .then((r) => r.data.data as GradeReport);
  },

  getTeacherReport(id: string) {
    return axiosInstance
      .get(`${endpoints.reports.teacher}/${id}`)
      .then((r) => r.data.data as TeacherReport);
  },

  getHouseReport(id: string) {
    return axiosInstance
      .get(`${endpoints.reports.house}/${id}`)
      .then((r) => r.data.data as HouseReport);
  },

  getTeamsReport() {
    return axiosInstance
      .get(endpoints.reports.teams)
      .then((r) => r.data.data as TeamsReport);
  },
};
