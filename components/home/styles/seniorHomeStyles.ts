import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 80,
  },
  topBar: {
    position: 'absolute',
    top: 48,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 100,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topBarTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  createBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', fontWeight: '600' },
  burger: {
    width: 28,
    height: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  burgerLine: { width: '100%', height: 2, backgroundColor: '#fff', borderRadius: 1 },
  overlayClose: { position: 'absolute', top: 16, right: 16, width: 28, height: 20, justifyContent: 'space-between' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  drawer: {
    width: 260,
    backgroundColor: '#111',
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  drawerTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 16 },
  drawerItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#222' },
  drawerItemText: { color: '#e5e7eb', fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  // dropdown (hamburger below)
  dropdown: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#222',
    minWidth: 200,
    paddingVertical: 6,
    zIndex: 50,
  },
  dropdownTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemText: { color: '#e5e7eb', fontSize: 14 },
  welcomeSection: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#e5e7eb',
    opacity: 0.9,
  },
  profileSummary: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 16,
  },
  profileRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  profileLabel: {
    width: 80,
    fontSize: 14,
    color: '#9ca3af',
  },
  profileValue: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#e5e7eb',
  },
});
