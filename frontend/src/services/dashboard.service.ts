import api from "./api";
import type { AdminStats, StudentStats, TeacherStats } from "@/types";

export const dashboardService = {
  async getAdminStats(): Promise<AdminStats> {
    const { data } = await api.get<AdminStats>("/dashboard/admin");
    return data;
  },
  async getTeacherStats(): Promise<TeacherStats> {
    const { data } = await api.get<TeacherStats>("/dashboard/teacher");
    return data;
  },
  async getStudentStats(): Promise<StudentStats> {
    const { data } = await api.get<StudentStats>("/dashboard/student");
    return data;
  },
};
