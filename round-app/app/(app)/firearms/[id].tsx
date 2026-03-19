import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

export default function FirearmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: firearm, isLoading: fLoading, refetch, isRefetching } = useQuery({
    queryKey: ['firearm', id],
    queryFn: () => api.get(`/firearms/${id}`).then((r) => r.data),
  });

  const { data: sessions } = useQuery({
    queryKey: ['sessions', id],
    queryFn: () => api.get(`/sessions?firearmId=${id}&limit=10`).then((r) => r.data),
  });

  const { data: tasks } = useQuery({
    queryKey: ['maintenance', id],
    queryFn: () => api.get(`/maintenance?firearmId=${id}`).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/firearms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firearms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert('Delete Firearm', 'This will also delete all sessions and maintenance tasks for this firearm. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  if (fLoading) return <View style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteBtn}>Delete</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroName}>{firearm?.name}</Text>
          <Text style={styles.heroSub}>{firearm?.make} {firearm?.model} · {firearm?.caliber}</Text>
          <Text style={styles.heroRounds}>{firearm?.totalRounds?.toLocaleString()}</Text>
          <Text style={styles.heroRoundsLabel}>total rounds</Text>
          {firearm?.serialNumber && <Text style={styles.heroSerial}>S/N: {firearm.serialNumber}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Maintenance</Text>
        {(tasks ?? []).map((task: any) => {
          const color = task.isOverdue ? '#e74c3c' : task.roundsRemaining < 100 ? '#f0a500' : '#27ae60';
          return (
            <View key={task._id} style={[styles.row, task.isOverdue && styles.rowOverdue]}>
              <Text style={styles.rowTitle}>{task.name}</Text>
              <Text style={[styles.rowStatus, { color }]}>
                {task.isOverdue ? 'OVERDUE' : `${task.roundsRemaining} rds left`}
              </Text>
            </View>
          );
        })}
        <TouchableOpacity
          style={styles.addTaskBtn}
          onPress={() => router.push({ pathname: '/(app)/maintenance/new', params: { firearmId: id } })}
        >
          <Text style={styles.addTaskText}>+ Add Maintenance Task</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {(sessions ?? []).map((s: any) => (
          <View key={s._id} style={styles.row}>
            <Text style={styles.rowTitle}>{new Date(s.date).toLocaleDateString()}</Text>
            <Text style={styles.rowRounds}>+{s.roundsFired} rds</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  back: { fontSize: 16, color: '#1a1a1a' },
  deleteBtn: { fontSize: 16, color: '#e74c3c' },
  heroCard: { backgroundColor: '#1a1a1a', margin: 16, padding: 24, borderRadius: 16 },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 14, color: '#aaa', marginTop: 4 },
  heroRounds: { fontSize: 48, fontWeight: '900', color: '#fff', marginTop: 20 },
  heroRoundsLabel: { fontSize: 14, color: '#aaa' },
  heroSerial: { fontSize: 12, color: '#666', marginTop: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 16, marginTop: 8, marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 14, borderRadius: 10 },
  rowOverdue: { borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', flex: 1 },
  rowStatus: { fontSize: 13, fontWeight: '600' },
  rowRounds: { fontSize: 16, fontWeight: '700', color: '#27ae60' },
  addTaskBtn: { marginHorizontal: 16, marginBottom: 16, padding: 14, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: '#ccc', alignItems: 'center' },
  addTaskText: { color: '#666', fontSize: 15 },
});
