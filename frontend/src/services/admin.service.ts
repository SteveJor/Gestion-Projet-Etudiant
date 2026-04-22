import api from "./api";
import type {
  User,
  UserCreatePayload,
  UserListResponse,
  UserUpdatePayload,
} from "@/types";

export const adminService = {
  async listUsers(params?: {
    role?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }): Promise<UserListResponse> {
    const { data } = await api.get<UserListResponse>("/admin/users", { params });
    return data;
  },

  async getUser(id: number): Promise<User> {
    const { data } = await api.get<User>(`/admin/users/${id}`);
    return data;
  },

  async createUser(payload: UserCreatePayload): Promise<User> {
    const { data } = await api.post<User>("/admin/users", payload);
    return data;
  },

  async updateUser(id: number, payload: UserUpdatePayload): Promise<User> {
    const { data } = await api.put<User>(`/admin/users/${id}`, payload);
    return data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  },
};
