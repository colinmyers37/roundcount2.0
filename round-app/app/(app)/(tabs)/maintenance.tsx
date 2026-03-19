import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

function fetchTasks() {
  return api.get('/maintenance').then((r) => r.data);
}

export default function MaintenanceScreen() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['maintenance'],
    queryFn: fetchTasks,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/maintenance/${id}/complete`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleComplete = (task: any) => {
    Alert.alert(
      'Mark Complete',
      `Mark "${task.name}" as done?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => completeMutation.mutate(task._id) },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Maintenance</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/maintenance/new')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const statusColor = item.isOverdue ? '#e74c3c' : item.roundsRemaining < 100 ? '#f0a500' : '#27ae60';
          const statusText = item.isOverdue
            ? 'OVERDUE'
            : `${item.roundsRemaining} rds left`;

          return (
            <View style={[styles.card, item.isOverdue && styles.cardOverdue]}>
              <View style={styles.cardLeft}>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.firearmId}>Every {item.intervalRounds.toLocaleString()} rounds</Text>
                <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
              </View>
              {item.isOverdue && (
                <TouchableOpacity style={styles.completeBtn} onPress={() => handleComplete(item)}>
                  <Text style={styles.completeBtnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No maintenance tasks.</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/maintenance/new')}>
                <Text style={styles.emptyLink}>Add your first task</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  addButton: { backgroundColor: '#1a1a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  list: { padding: 16, paddingTop: 0 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10 },
  cardOverdue: { borderLeftWidth: 4, borderLeftColor: '#e74c3c' },
  cardLeft: { flex: 1 },
  taskName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  firearmId: { fontSize: 13, color: '#666', marginTop: 2 },
  status: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  completeBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  completeBtnText: { color: '#fff', fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyLink: { fontSize: 16, color: '#1a1a1a', textDecorationLine: 'underline' },
});
