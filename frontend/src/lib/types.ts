// frontend/src/lib/types.ts
// Tipos TypeScript para entidades y respuestas de la app

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
  create_at: string; // ISO string (e.g., "2023-10-01T12:00:00Z")
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
  created_at: string; // ISO string
  updated_at: string; // ISO string
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
  payment_status: string;
  timestamp: string; // ISO string
}

export interface Integration {
  user_id: number;
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

export interface FetchResponse<T> {
  data: T | null;
  error: string | HTTPValidationError | null;
  total_pages?: number;
}

// src/lib/types.ts
export interface UserInfo {
  user_id: string | null;
  email: string | null;
  username: string | null;
  user_type: string;
  subscription: string | null;
  credits: number;
  rol: string | null;
  session_id?: string;
  gamification: UserGamificationResponse[]; // Actualizado para reflejar /whoami
}

export interface EventType {
  id: number;
  name: string;
  description?: string;
  points_per_event: number;
}

export interface Badge {
  id: number;
  name: string;
  description?: string;
  event_type_id: number;
  required_points: number;
  user_type: string; // "anonymous", "registered", "both"
}

export interface Gamification {
  points: number;
  badges: Badge[];
}

export interface GamificationEventCreate {
  event_type_id: number;
}

export interface GamificationEventResponse {
  id: number;
  event_type_id: number;
  user_id?: number;
  session_id?: string;
  timestamp: string; // ISO string
}

export interface UserGamificationResponse {
  points: number;
  badge_id?: number;
  event_type_id: number;
  user_id?: number;
  session_id?: string;
  event_type: EventType;
  badge?: Badge;
}
export interface RankingResponse {
  username: string;
  points: number;
  badges_count: number;
  user_type: string;
}

export interface PaymentProvider {
  id: number;
  name: string;
  active: boolean;
}

export interface InfoResponse {
  credits: number;
  gamification: { points: number; badge: Badge | null }[];
}

export interface BadgeWithEventType extends Badge {
  event_type: EventType;
}

// src/lib/types.ts

// Nuevo tipo para cupones
export interface Coupon {
  id: number;
  name: string;
  description?: string;
  unique_identifier: string;
  issued_at: string; // ISO string
  expires_at?: string; // ISO string, opcional
  redeemed_at?: string; // ISO string, opcional
  active: boolean;
  status: "active" | "redeemed" | "expired" | "disabled";
  credits: number;
  user_id?: number; // Opcional, para usuarios registrados
  session_id?: string; // Opcional, para usuarios anónimos
  redeemed_by_user_id?: number; // Quién lo canjeó, si aplica
  redeemed_by_session_id?: string; // Quién lo canjeó (anónimo), si aplica
}

export interface CouponType {
  id: number;
  name: string;
  description?: string;
  credits: number;
  active: boolean;
}

export interface CouponActivity {
  id: number;
  coupon_type: string;
  unique_identifier: string;
  user_id?: number;
  session_id?: string;
  status: string;
  issued_at: string;
  redeemed_at?: string;
}

export interface AllowedOrigin {
  id: number;
  origin: string;
}
// frontend/src/lib/types.ts (actualización)
export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  rating: any;
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  is_digital: boolean;
  is_free: boolean;
  file_path?: string;
  subscription_duration?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string;
  is_digital: boolean;
  file_path?: string;
}

export interface Order {
  id: number;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}
