import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../lib/api';

function fetchDashboard() {
  return api.get('/dashboard').then((r) => r.data);
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard,
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <Text style={styles.greeting}>Hey, {user?.displayName}</Text>
        <Text style={styles.totalRounds}>
          {isLoading ? '—' : data?.totalRoundsAllTime?.toLocaleString()} total rounds
        </Text>

        {data?.overdueMaintenanceCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => router.push('/(app)/(tabs)/maintenance')}
          >
            <Text style={styles.alertText}>
              ⚠️ {data.overdueMaintenanceCount} maintenance task
              {data.overdueMaintenanceCount !== 1 ? 's' : ''} overdue
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.logButton}
          onPress={() => router.push('/(app)/sessions/new')}
        >
          <Text style={styles.logButtonText}>+ Log Session</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your Firearms</Text>
        {data?.firearms?.map((f: any) => (
          <TouchableOpacity
            key={f._id}
            style={styles.card}
            onPress={() => router.push(`/(app)/firearms/${f._id}`)}
          >
            <Text style={styles.cardTitle}>{f.name}</Text>
            <Text style={styles.cardSub}>{f.make} {f.model} · {f.caliber}</Text>
            <Text style={styles.cardRounds}>{f.totalRounds.toLocaleString()} rounds</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {data?.recentSessions?.map((s: any) => (
          <View key={s._id} style={styles.sessionRow}>
            <Text style={styles.sessionFirearm}>{s.firearmId?.name ?? 'Unknown'}</Text>
            <Text style={styles.sessionRounds}>+{s.roundsFired} rds</Text>
            <Text style={styles.sessionDate}>{new Date(s.date).toLocaleDateString()}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  greeting: { fontSize: 16, color: '#666', paddingHorizontal: 16, paddingTop: 16 },
  totalRounds: { fontSize: 36, fontWeight: '800', color: '#1a1a1a', paddingHorizontal: 16, marginBottom: 16 },
  alertBanner: { backgroundColor: '#fff3cd', margin: 16, padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#f0a500' },
  alertText: { color: '#856404', fontWeight: '600' },
  logButton: { backgroundColor: '#1a1a1a', margin: 16, padding: 16, borderRadius: 10, alignItems: 'center' },
  logButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  card: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 2 },
  cardRounds: { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginTop: 8 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 10 },
  sessionFirearm: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  sessionRounds: { fontSize: 14, fontWeight: '700', color: '#27ae60', marginRight: 12 },
  sessionDate: { fontSize: 12, color: '#999' },
});
