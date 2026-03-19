import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Display Name</Text>
        <Text style={styles.value}>{user?.displayName}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 24 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10 },
  label: { fontSize: 12, color: '#999', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  logoutButton: { backgroundColor: '#e74c3c', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
