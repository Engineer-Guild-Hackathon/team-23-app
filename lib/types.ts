// lib/types.ts
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'senior' | 'org';

export type Gender = 'male' | 'female' | 'other' | 'no_answer';

export type OrgType = 'education' | 'government' | 'npo' | 'company';

export interface SeniorProfileData {
  nickname: string;
  gender: Gender;
  birthDate: string;
  hobbies: string[];
  skills: string[];
}

export interface OrgProfileData {
  organizationName: string;
  organizationType: OrgType;
  establishedYear?: number | null;
  websiteUrl?: string | null;
  contactEmail: string;
  contactPhone?: string | null;
  services: string[];
  targetAudience: string[];
}

export interface Profile {
  uid: string;
  role: UserRole;
  name: string; // seniorならnickname、orgならorganizationName
  area: { pref: string; city: string };
  bio?: string;
  photoUrl?: string;

  seniorProfile?: SeniorProfileData;
  orgProfile?: OrgProfileData;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  version: number;
}

export interface AppUser {
  uid: string;
  email: string | null;
  role?: UserRole;
  onboardingDone?: boolean;
}
