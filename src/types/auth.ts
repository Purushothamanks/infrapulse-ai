export type UserRole = 'admin' | 'citizen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  officialId?: string; // For Admin officials
  cardNumber?: string; // Permanent municipal card number for Admin login
  verified: boolean;
  department?: string;
}

export interface VerificationRequest {
  email: string;
  name: string;
  role: UserRole;
  code: string;
  officialId?: string;
}
