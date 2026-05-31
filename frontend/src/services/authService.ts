import { apiClient } from '../api/apiClient';
import type { AuthResponse, User } from '../types';

export const authService = {
  async register(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async login(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/profile');
    return response.data;
  },
};
