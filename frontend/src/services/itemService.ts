import { apiClient } from '../api/apiClient';
import type { ItemPost, PaginatedResponse, CreateItemRequest } from '../types';

export const itemService = {
  async createItem(data: CreateItemRequest, imageFile?: File): Promise<ItemPost> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('color', data.color);
    formData.append('description', data.description);
    formData.append('lastKnownLocation', data.lastKnownLocation);
    formData.append('claimLocation', data.claimLocation);
    if (data.additionalDetails) {
      formData.append('additionalDetails', data.additionalDetails);
    }
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    const response = await apiClient.post<ItemPost>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getItems(page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await apiClient.get<PaginatedResponse<ItemPost>>('/items', {
      params: { page, size },
    });
    return response.data;
  },

  async getItemById(id: number): Promise<ItemPost> {
    const response = await apiClient.get<ItemPost>(`/items/${id}`);
    return response.data;
  },

  async searchItems(keyword: string, page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await apiClient.get<PaginatedResponse<ItemPost>>('/items/search', {
      params: { keyword, page, size },
    });
    return response.data;
  },

  async filterByStatus(status: string, page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await apiClient.get<PaginatedResponse<ItemPost>>('/items/filter/status', {
      params: { status, page, size },
    });
    return response.data;
  },

  async updateItemStatus(id: number, status: string): Promise<ItemPost> {
    const response = await apiClient.patch<ItemPost>(`/items/${id}/status`, { status });
    return response.data;
  },

  async deleteItem(id: number): Promise<void> {
    await apiClient.delete(`/items/${id}`);
  },

  async getUserItems(page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await apiClient.get<PaginatedResponse<ItemPost>>('/items/my-items', {
      params: { page, size },
    });
    return response.data;
  },
};
