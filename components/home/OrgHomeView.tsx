import { Profile } from '@/lib/types';
import React from 'react';
import { ScrollView, Text, View, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { styles } from './styles/orgHomeStyles';

interface OrgHomeViewProps {
  profile: Profile;
}

export const OrgHomeView: React.FC<OrgHomeViewProps> = ({ profile }) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const getOrgTypeLabel = (orgType?: string) => {
    switch (orgType) {
      case 'education':
        return '教育機関';
      case 'government':
        return '地方自治体';
      case 'npo':
        return 'NPO・NGO';
      case 'company':
        return '企業';
      default:
        return '組織';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          accessibilityLabel="メニュー"
          onPress={() => setMenuOpen((v) => !v)}
          style={styles.burger}
        >
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
          <View style={styles.burgerLine} />
        </TouchableOpacity>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.drawer}>
            <Text style={styles.drawerTitle}>メニュー</Text>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)');
              }}
            >
              <Text style={styles.drawerItemText}>ホーム</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)/profile');
              }}
            >
              <Text style={styles.drawerItemText}>プロフィール</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={() => {
                setMenuOpen(false);
                router.push('/(app)/create-event');
              }}
            >
              <Text style={styles.drawerItemText}>イベント作成</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.drawerItem}
              onPress={async () => {
                try {
                  setMenuOpen(false);
                  await signOut(auth);
                  router.replace('/(auth)/login');
                } catch (e) {}
              }}
            >
              <Text style={styles.drawerItemText}>ログアウト</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.backdrop} onPress={() => setMenuOpen(false)} />
        </View>
      </Modal>

      {/* ウェルカムのみ表示（カード風ではなくシンプルに） */}
      <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>ようこそ</Text>
        <Text style={styles.orgName}>
          {profile.orgProfile?.organizationName || profile.name}
        </Text>
      </View>

      {/* 進行中のイベント、クイックアクションは非表示にしました */}
      {/* 未実装セクションは削除済み */}
    </ScrollView>
  );
};

/* styles moved to ./styles/orgHomeStyles */
