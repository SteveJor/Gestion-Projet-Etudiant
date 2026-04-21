import api from "./api";
import type {
  Project,
  ProjectCreatePayload,
  ProjectListResponse,
  ProjectUpdatePayload,
} from "@/types";

export const projectService = {
  async listOpen(params: {
    page?: number;
    per_page?: number;
    search?: string;
    domain?: string;
  }): Promise<ProjectListResponse> {
    const { data } = await api.get<ProjectListResponse>("/projects", { params });
    return data;
  },

  async getById(id: number): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: ProjectCreatePayload): Promise<Project> {
    const { data } = await api.post<Project>("/projects", payload);
    return data;
  },

  async update(id: number, payload: ProjectUpdatePayload): Promise<Project> {
    const { data } = await api.put<Project>(`/projects/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async getMyProjects(): Promise<Project[]> {
    const { data } = await api.get<Project[]>("/projects/teacher/mine");
    return data;
  },
};
