// src/lib/types.ts
export interface User {
  id: number;
  email: string;
  username: string;
  rol: string;
  activo: boolean;
  subscription: string;
  ciudad?: string;
  website?: string;
  credits: number;
  create_at: string;  // ISO string (e.g., "2023-10-01T12:00:00Z")
  last_ip?: string;
  last_login: string;
  user_type: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  ciudad?: string;
  website?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  username?: string;
  ciudad?: string;
  website?: string;
}

export interface PurchaseRequest {
  credits: number;
  payment_amount: number;
  payment_method?: string;
}

export interface PurchaseResponse {
  transaction_id: string;
  credits_added: number;
  new_balance: number;
}

export interface PaymentMethod {
  id: number;
  payment_type: string;
  details: string;
  is_default: boolean;
  created_at: string;  // ISO string
  updated_at: string;  // ISO string
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status?: string;
  timestamp: string; // ISO string
}

export interface Integration {
  id: number;
  name: string;
  webhook_url: string;
  event_type: string;
  active: boolean;
  created_at: string;
  last_triggered: string | null;
}

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    description?: string;
    tag?: string;
    updated_by?: number;
    updated_at: string; // ISO string
}