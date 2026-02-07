import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";
import type { Student } from "@/types/models";

export type CreateStudentPayload = {
  firstNameSi?: string;
  lastNameSi?: string;
  firstNameEn: string;
  lastNameEn: string;
  admissionNumber: string;
  admissionDate: string;
  dob: string;
  gradeId: string;
  sectionId?: string;
  email?: string;
  phoneNum?: string;
  addressSi?: string;
  addressEn?: string;
  emergencyContacts?: Array<{
    nameSi?: string;
    nameEn?: string;
    relationshipSi?: string;
    relationshipEn?: string;
    number?: string;
  }>;
  academicYear: number;
  photoUrl?: string;
  status?: "active" | "inactive";
  activeNote?: string;
  inactiveNote?: string;
};

export type UpdateStudentPayload = Partial<CreateStudentPayload>;

export const studentsService = {
  create(payload: CreateStudentPayload) {
    return axiosInstance
      .post(endpoints.students, payload)
      .then((r) => r.data.data as Student);
  },

  listByGrade(gradeId: string, academicYear?: number) {
    return axiosInstance
      .get(`${endpoints.students}/by-grade`, { params: { gradeId, academicYear } })
      .then((r) => r.data.data as Student[]);
  },

  update(id: string, payload: UpdateStudentPayload) {
    return axiosInstance
      .patch(`${endpoints.students}/${id}`, payload)
      .then((r) => r.data.data as Student);
  },

  list(params: {
    page?: number;
    limit?: number;
    search?: string;
    gradeId?: string;
    sectionId?: string;
    academicYear?: number;
  }) {
    return axiosInstance
      .get(endpoints.students, { params })
      .then((r) => r.data.data as {
        items: Student[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      });
  },

  remove(id: string) {
    return axiosInstance
      .delete(`${endpoints.students}/${id}`)
      .then((r) => r.data.data as { deleted: true });
  },

  addNote(id: string, payload: { category?: string; content: string }) {
    return axiosInstance
      .post(`${endpoints.students}/${id}/notes`, payload)
      .then((r) => r.data.data as Student);
  },

  removeNote(id: string, noteId: string) {
    return axiosInstance
      .delete(`${endpoints.students}/${id}/notes/${noteId}`)
      .then((r) => r.data.data as Student);
  },

  get360(id: string, year?: number) {
    return axiosInstance
      .get(`${endpoints.students}/${id}/360`, { params: { year } })
      .then((r) => r.data.data);
  },

  bulkImport(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return axiosInstance
      .post(`${endpoints.students}/bulk-import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data.data as { success: number; failed: number; errors: any[] });
  },
};
