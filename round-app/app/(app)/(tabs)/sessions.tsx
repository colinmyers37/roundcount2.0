import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

function fetchSessions() {
  return api.get('/sessions?limit=50').then((r) => r.data);
}

export default function SessionsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sessions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/sessions/new')}
        >
          <Text style={styles.addButtonText}>+ Log</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardLeft}>
              <Text style={styles.firearmName}>{item.firearmId?.name ?? 'Unknown'}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
              {item.location && <Text style={styles.location}>{item.location}</Text>}
              {item.notes && <Text style={styles.notes} numberOfLines={1}>{item.notes}</Text>}
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.rounds}>+{item.roundsFired}</Text>
              <Text style={styles.roundsLabel}>rds</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No sessions yet.</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/sessions/new')}>
                <Text style={styles.emptyLink}>Log your first session</Text>
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
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 10 },
  cardLeft: { flex: 1 },
  firearmName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  date: { fontSize: 13, color: '#666', marginTop: 2 },
  location: { fontSize: 12, color: '#999', marginTop: 2 },
  notes: { fontSize: 12, color: '#bbb', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  rounds: { fontSize: 24, fontWeight: '800', color: '#27ae60' },
  roundsLabel: { fontSize: 11, color: '#999' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyLink: { fontSize: 16, color: '#1a1a1a', textDecorationLine: 'underline' },
});
