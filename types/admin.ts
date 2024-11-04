// types/admin.ts
import { User } from "@prisma/client";

export interface AdminUser extends User {
  claims: AdminClaim[];
  totalClaims: number;
  lastActive: string;
}

export interface AdminClaim {
  id: string;
  claim: string;
  createdAt: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress?: number;
  documents?: AdminDocument[];
  userId: string;
  result?: number;
  lastUpdated: string;
}

export interface AdminDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export type UserRole = 'USER' | 'ADMIN';

export interface TableFilters {
  search: string;
  role: UserRole | 'ALL';
  status: string;
  dateRange: [Date | null, Date | null];
}