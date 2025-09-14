// lib/types.ts
import { Timestamp } from 'firebase/firestore';

export type UserRole = 'senior' | 'org';

export type Gender = 'male' | 'female' | 'other' | 'no_answer' | 'any';

export type OrgType = 'education' | 'government' | 'npo' | 'company';

export type AgeGroup = '50代' | '60代' | '70代' | '80代以上';

export type ITLevel =
  | '初心者'
  | '基礎レベル'
  | '中級レベル'
  | '上級レベル'
  | '不問';

// Base interfaces for common fields
export interface TimestampedEntity {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface VersionedEntity {
  version: number;
}

// Area type for consistent location handling
export interface Area {
  pref: string;
  city: string;
}

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

export interface EventPost {
  id: string;
  organizerId: string;
  organizationName: string;
  title: string;
  description: string;
  area: {
    pref: string;
    city: string;
  };
  targetGender: Gender;
  requiredSkills: string[];
  targetAgeGroups: AgeGroup[];
  itLevel: ITLevel;
  eventDate: Timestamp; // 開催日時
  eventEndDate?: Timestamp; // 終了日時（オプション）
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isActive: boolean;
  createdByRole: UserRole; // イベント作成者の役割
}

export type ApplicationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface EventApplication {
  id: string;
  eventId: string;
  applicantId: string;
  applicantName: string;
  organizerId: string;
  status: ApplicationStatus;
  message?: string; // 申込み時のメッセージ
  organizationResponse?: string; // 組織からの返答
  appliedAt: Timestamp;
  updatedAt: Timestamp;
}
