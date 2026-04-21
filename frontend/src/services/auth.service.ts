import api from "./api";
import type { LoginPayload, RegisterPayload, Token, User } from "@/types";

export const authService = {
  async login(payload: LoginPayload): Promise<Token> {
    const { data } = await api.post<Token>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>("/auth/register", payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};
