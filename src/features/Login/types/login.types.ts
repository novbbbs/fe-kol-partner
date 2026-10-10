export interface User {
  id: number;
  name: string;
  username: string; // 4-digit username
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}