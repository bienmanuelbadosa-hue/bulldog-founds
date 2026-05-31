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
  createdByTeamsLink?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'FACULTY' | 'STAFF';
  teamsLink?: string;
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
