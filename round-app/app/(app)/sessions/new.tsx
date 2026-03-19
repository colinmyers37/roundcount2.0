import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { api } from '../../../lib/api';
import { enqueue } from '../../../lib/sync-queue';

const schema = z.object({
  firearmId: z.string().min(1, 'Select a firearm'),
  date: z.string().min(1, 'Date is required'),
  roundsFired: z.string().min(1, 'Required').refine((v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
  location: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewSessionScreen() {
  const queryClient = useQueryClient();
  const { data: firearms } = useQuery({
    queryKey: ['firearms'],
    queryFn: () => api.get('/firearms').then((r) => r.data),
  });

  const today = new Date().toISOString().split('T')[0];

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { date: today, roundsFired: 50 as any },
  });

  const selectedFirearmId = watch('firearmId');

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['firearms'] });
      router.back();
    },
    onError: (e: any) => {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to log session');
    },
  });

  const onSubmit = async (data: FormData) => {
    const payload = { ...data, roundsFired: parseInt(data.roundsFired, 10) };
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      await enqueue({ method: 'POST', url: '/sessions', data: payload });
      Alert.alert('Saved Offline', 'Session queued and will sync when you reconnect.');
      router.back();
      return;
    }
    mutation.mutate(payload);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Log Session</Text>
          </View>

          <Text style={styles.label}>Firearm *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {(firearms ?? []).map((f: any) => (
              <TouchableOpacity
                key={f._id}
                style={[styles.chip, selectedFirearmId === f._id && styles.chipSelected]}
                onPress={() => setValue('firearmId', f._id)}
              >
                <Text style={[styles.chipText, selectedFirearmId === f._id && styles.chipTextSelected]}>
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {errors.firearmId && <Text style={styles.errorText}>{errors.firearmId.message}</Text>}

          <Text style={styles.label}>Date *</Text>
          <Controller
            control={control}
            name="date"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.date && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="YYYY-MM-DD"
              />
            )}
          />
          {errors.date && <Text style={styles.errorText}>{errors.date.message}</Text>}

          <Text style={styles.label}>Rounds Fired *</Text>
          <Controller
            control={control}
            name="roundsFired"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.roundsFired && styles.inputError]}
                value={String(value)}
                onChangeText={onChange}
                keyboardType="numeric"
              />
            )}
          />
          {errors.roundsFired && <Text style={styles.errorText}>{errors.roundsFired.message}</Text>}

          <Text style={styles.label}>Location (optional)</Text>
          <Controller
            control={control}
            name="location"
            render={({ field: { onChange, value } }) => (
              <TextInput style={styles.input} value={value} onChangeText={onChange} />
            )}
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={value}
                onChangeText={onChange}
                multiline
              />
            )}
          />

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Logging...' : 'Log Session'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  back: { fontSize: 16, color: '#1a1a1a' },
  title: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  label: { fontSize: 13, color: '#666', marginBottom: 6, marginTop: 16 },
  chipScroll: { marginBottom: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  chipSelected: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  chipText: { fontSize: 14, color: '#1a1a1a' },
  chipTextSelected: { color: '#fff' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16 },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 2 },
  button: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
