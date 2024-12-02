export interface AuthUser {
  id: string;
  username: string;
  avatarUrl: string;
}

export interface LoginCredentials {
  username: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}