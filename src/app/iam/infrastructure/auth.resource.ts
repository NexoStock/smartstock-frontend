import { BusinessType } from '../../shared/config/menu';

export interface SessionResource {
  token: string;
  email: string;
  businessName: string;
  businessType: BusinessType;
}

export interface RegisterRequest {
  businessName: string;
  email: string;
  password: string;
  businessType: BusinessType;
}

export interface ForgotPasswordResponse {
  sent: boolean;
  email: string;
  expiresInHours: number;
}