// src/lib/types.ts
export interface User {
  email: string;
  username: string;
  plan: string;
  consultas_restantes: number;
  rol: string;
  user_type: string; // Añadido
  ciudad?: string;
  url?: string;
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
  url?: string;
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

export interface HTTPValidationError {
  detail: ValidationError[];
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}