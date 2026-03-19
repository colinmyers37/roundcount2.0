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

function fetchFirearms() {
  return api.get('/firearms').then((r) => r.data);
}

export default function FirearmsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['firearms'],
    queryFn: fetchFirearms,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Firearms</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/(app)/firearms/new')}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={data ?? []}
        keyExtractor={(item) => item._id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/(app)/firearms/${item._id}`)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardSub}>{item.make} {item.model}</Text>
              <Text style={styles.cardCaliber}>{item.caliber}</Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.roundCount}>{item.totalRounds.toLocaleString()}</Text>
              <Text style={styles.roundLabel}>rounds</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No firearms yet.</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/firearms/new')}>
                <Text style={styles.emptyLink}>Add your first firearm</Text>
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
  cardName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  cardSub: { fontSize: 13, color: '#666', marginTop: 2 },
  cardCaliber: { fontSize: 13, color: '#999', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', justifyContent: 'center' },
  roundCount: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  roundLabel: { fontSize: 11, color: '#999' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 8 },
  emptyLink: { fontSize: 16, color: '#1a1a1a', textDecorationLine: 'underline' },
});
