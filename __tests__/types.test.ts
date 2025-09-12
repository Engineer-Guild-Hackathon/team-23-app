import { Profile } from '../lib/types';
import { Timestamp } from 'firebase/firestore';

describe('Types', () => {
  it('should define Profile interface correctly', () => {
    // Profile インターフェースの基本的なテスト
    const mockProfile: Profile = {
      uid: 'test-uid',
      name: 'Test User',
      role: 'senior',
      area: {
        pref: 'Tokyo',
        city: 'Shibuya',
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      version: 1,
    };

    expect(mockProfile).toBeDefined();
    expect(mockProfile.uid).toBe('test-uid');
    expect(mockProfile.name).toBe('Test User');
    expect(mockProfile.role).toBe('senior');
  });

  it('should handle optional fields in Profile', () => {
    // 最小限のプロフィール
    const minimalProfile: Profile = {
      uid: 'test-uid',
      name: 'Test Organization',
      role: 'org',
      area: {
        pref: 'Osaka',
        city: 'Namba',
      },
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      version: 1,
    };

    expect(minimalProfile).toBeDefined();
    expect(minimalProfile.bio).toBeUndefined();
    expect(minimalProfile.seniorProfile).toBeUndefined();
    expect(minimalProfile.orgProfile).toBeUndefined();
  });
});
