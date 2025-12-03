import { axiosInstance } from "@/lib/axios";
import { endpoints } from "@/lib/endpoints";

export type LinkParentStudentPayload = {
  parentId: string;
  studentId: string;
  relationshipSi?: string;
  relationshipEn?: string;
  isPrimary?: boolean;
};

export const parentStudentLinksService = {
  link(payload: LinkParentStudentPayload) {
    return axiosInstance
      .post(endpoints.parentStudentLinks, payload)
      .then((r) => r.data.data);
  },

  update(id: string, payload: Omit<LinkParentStudentPayload, "parentId" | "studentId">) {
    return axiosInstance
      .patch(`${endpoints.parentStudentLinks}/${id}`, payload)
      .then((r) => r.data.data);
  },

  unlink(id: string) {
    return axiosInstance
      .delete(`${endpoints.parentStudentLinks}/${id}`)
      .then((r) => r.data.data as { unlinked: true });
  },
};
