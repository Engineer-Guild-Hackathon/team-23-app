// __tests__/types.test.ts
import { Timestamp } from 'firebase/firestore';
import {
  Gender,
  OrgProfileData,
  OrgType,
  Profile,
  SeniorProfileData,
  UserRole,
} from '../lib/types';

describe('Type Definitions', () => {
  describe('UserRole', () => {
    it('should accept valid role values', () => {
      const seniorRole: UserRole = 'senior';
      const orgRole: UserRole = 'org';

      expect(seniorRole).toBe('senior');
      expect(orgRole).toBe('org');
    });
  });

  describe('Gender', () => {
    it('should accept valid gender values', () => {
      const male: Gender = 'male';
      const female: Gender = 'female';
      const other: Gender = 'other';
      const noAnswer: Gender = 'no_answer';

      expect([male, female, other, noAnswer]).toEqual([
        'male',
        'female',
        'other',
        'no_answer',
      ]);
    });
  });

  describe('OrgType', () => {
    it('should accept valid organization types', () => {
      const education: OrgType = 'education';
      const government: OrgType = 'government';
      const npo: OrgType = 'npo';
      const company: OrgType = 'company';

      expect([education, government, npo, company]).toEqual([
        'education',
        'government',
        'npo',
        'company',
      ]);
    });
  });

  describe('SeniorProfileData', () => {
    it('should create a valid senior profile', () => {
      const seniorProfile: SeniorProfileData = {
        nickname: 'テスト太郎',
        gender: 'male',
        birthDate: '1950-01-01',
        hobbies: ['料理', '読書'],
        skills: ['英語', 'IT'],
      };

      expect(seniorProfile.nickname).toBe('テスト太郎');
      expect(seniorProfile.gender).toBe('male');
      expect(seniorProfile.hobbies).toHaveLength(2);
      expect(seniorProfile.skills).toHaveLength(2);
    });
  });

  describe('OrgProfileData', () => {
    it('should create a valid organization profile', () => {
      const orgProfile: OrgProfileData = {
        organizationName: 'テスト教育委員会',
        organizationType: 'education',
        contactEmail: 'test@example.com',
        services: ['講座・研修', 'イベント企画'],
        targetAudience: ['60代', '70代'],
      };

      expect(orgProfile.organizationName).toBe('テスト教育委員会');
      expect(orgProfile.organizationType).toBe('education');
      expect(orgProfile.contactEmail).toBe('test@example.com');
      expect(orgProfile.services).toHaveLength(2);
      expect(orgProfile.targetAudience).toHaveLength(2);
    });

    it('should handle optional fields', () => {
      const orgProfile: OrgProfileData = {
        organizationName: 'テスト組織',
        organizationType: 'npo',
        contactEmail: 'contact@test.org',
        services: [],
        targetAudience: [],
        establishedYear: 2020,
        websiteUrl: 'https://test.org',
        contactPhone: '03-1234-5678',
      };

      expect(orgProfile.establishedYear).toBe(2020);
      expect(orgProfile.websiteUrl).toBe('https://test.org');
      expect(orgProfile.contactPhone).toBe('03-1234-5678');
    });
  });

  describe('Profile', () => {
    const mockTimestamp = Timestamp.now();

    it('should create a valid senior profile', () => {
      const profile: Profile = {
        uid: 'test-uid',
        role: 'senior',
        name: 'テスト太郎',
        area: { pref: '東京都', city: '渋谷区' },
        seniorProfile: {
          nickname: 'テスト太郎',
          gender: 'male',
          birthDate: '1950-01-01',
          hobbies: ['料理'],
          skills: ['英語'],
        },
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        version: 1,
      };

      expect(profile.role).toBe('senior');
      expect(profile.seniorProfile).toBeDefined();
      expect(profile.orgProfile).toBeUndefined();
      expect(profile.seniorProfile?.nickname).toBe('テスト太郎');
    });

    it('should create a valid organization profile', () => {
      const profile: Profile = {
        uid: 'test-org-uid',
        role: 'org',
        name: 'テスト教育委員会',
        area: { pref: '大阪府', city: '大阪市' },
        orgProfile: {
          organizationName: 'テスト教育委員会',
          organizationType: 'education',
          contactEmail: 'contact@test.edu',
          services: ['講座・研修'],
          targetAudience: ['60代'],
        },
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        version: 1,
      };

      expect(profile.role).toBe('org');
      expect(profile.orgProfile).toBeDefined();
      expect(profile.seniorProfile).toBeUndefined();
      expect(profile.orgProfile?.organizationName).toBe('テスト教育委員会');
    });

    it('should handle optional fields', () => {
      const profile: Profile = {
        uid: 'test-uid',
        role: 'senior',
        name: 'テスト花子',
        area: { pref: '神奈川県', city: '横浜市' },
        bio: 'よろしくお願いします',
        photoUrl: 'https://example.com/photo.jpg',
        seniorProfile: {
          nickname: 'テスト花子',
          gender: 'female',
          birthDate: '1955-06-15',
          hobbies: [],
          skills: [],
        },
        createdAt: mockTimestamp,
        updatedAt: mockTimestamp,
        version: 1,
      };

      expect(profile.bio).toBe('よろしくお願いします');
      expect(profile.photoUrl).toBe('https://example.com/photo.jpg');
    });
  });
});
