import { BusinessType } from '../../../shared/config/menu';

// The signed-in user. The business type decides which menu and screens are enabled (US01).
export class UserSession {
  constructor(
    public token: string,
    public email: string,
    public businessName: string,
    public businessType: BusinessType,
  ) {}
}