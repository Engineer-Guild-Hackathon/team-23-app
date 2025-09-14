import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  sub: { fontSize: 14, color: '#e5e7eb', marginBottom: 2 },
  meta: { fontSize: 12, color: '#9ca3af' },
  text: { fontSize: 14, color: '#e5e7eb', lineHeight: 20, marginBottom: 8 },
  applyBox: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333' },
  applyButton: { backgroundColor: '#4f46e5', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  applyButtonDisabled: { backgroundColor: '#9ca3af' },
  applyButtonText: { color: '#fff', fontWeight: '600' },
  info: { color: '#e5e7eb' },
  success: { color: '#059669', fontWeight: '600' },
  error: { color: '#dc2626', fontWeight: '600' },
});

