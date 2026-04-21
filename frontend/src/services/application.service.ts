import api from "./api";
import type {
  Application,
  ApplicationCreatePayload,
  ApplicationStatusUpdatePayload,
} from "@/types";

export const applicationService = {
  async apply(projectId: number, payload: ApplicationCreatePayload): Promise<Application> {
    const { data } = await api.post<Application>(
      `/applications/projects/${projectId}`,
      payload
    );
    return data;
  },

  async getMyApplications(): Promise<Application[]> {
    const { data } = await api.get<Application[]>("/applications/mine");
    return data;
  },

  async getProjectApplications(projectId: number): Promise<Application[]> {
    const { data } = await api.get<Application[]>(
      `/applications/projects/${projectId}`
    );
    return data;
  },

  async updateStatus(
    applicationId: number,
    payload: ApplicationStatusUpdatePayload
  ): Promise<Application> {
    const { data } = await api.patch<Application>(
      `/applications/${applicationId}/status`,
      payload
    );
    return data;
  },
};
