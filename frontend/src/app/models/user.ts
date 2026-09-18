export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface ProfileUpdateData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export interface AuthResponse {
  message: string;
  access_token: string;
  token_type: 'Bearer';
  user: User;
}

export interface UserResponse {
  message?: string;
  user: User;
}
