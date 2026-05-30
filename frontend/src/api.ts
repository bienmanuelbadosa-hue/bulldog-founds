const API_BASE_URL = 'http://localhost:8080/api';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'FACULTY' | 'STAFF';
  teamsLink?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface ItemPost {
  id: number;
  title: string;
  color: string;
  description: string;
  lastKnownLocation: string;
  claimLocation: string;
  additionalDetails?: string;
  imageUrl?: string;
  status: 'UNRESOLVED' | 'PENDING_CLAIM' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  createdByName: string;
  createdByEmail: string;
}

export interface CreateItemRequest {
  title: string;
  color: string;
  description: string;
  lastKnownLocation: string;
  claimLocation: string;
  additionalDetails?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}

class ApiService {
  private getHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  // Auth endpoints
  async register(email: string, password: string, firstName: string, lastName: string, role: string = 'STUDENT'): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  }

  // Item endpoints
  async createItem(data: CreateItemRequest, imageFile?: File): Promise<ItemPost> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('color', data.color);
    formData.append('description', data.description);
    formData.append('lastKnownLocation', data.lastKnownLocation);
    formData.append('claimLocation', data.claimLocation);
    if (data.additionalDetails) formData.append('additionalDetails', data.additionalDetails);
    if (imageFile) formData.append('imageFile', imageFile);

    const token = this.getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to create item');
    return response.json();
  }

  async getItems(page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await fetch(
      `${API_BASE_URL}/items?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch items');
    return response.json();
  }

  async getItemById(id: number): Promise<ItemPost> {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  }

  async searchItems(keyword: string, page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await fetch(
      `${API_BASE_URL}/items/search?keyword=${keyword}&page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error('Search failed');
    return response.json();
  }

  async filterByStatus(status: string, page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await fetch(
      `${API_BASE_URL}/items/filter/status?status=${status}&page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error('Filter failed');
    return response.json();
  }

  async updateItemStatus(id: number, status: string): Promise<ItemPost> {
    const response = await fetch(`${API_BASE_URL}/items/${id}/status`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
  }

  async deleteItem(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete item');
  }

  async getUserItems(page = 0, size = 10): Promise<PaginatedResponse<ItemPost>> {
    const response = await fetch(
      `${API_BASE_URL}/items/my-items?page=${page}&size=${size}`,
      { headers: this.getHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch user items');
    return response.json();
  }
}

export const apiService = new ApiService();
