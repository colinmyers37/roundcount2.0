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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

const schema = z.object({
  firearmId: z.string().min(1, 'Select a firearm'),
  name: z.string().min(1, 'Task name is required'),
  intervalRounds: z.string().min(1, 'Required').refine((v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
});
type FormData = z.infer<typeof schema>;

export default function NewMaintenanceScreen() {
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ firearmId?: string }>();
  const { data: firearms } = useQuery({
    queryKey: ['firearms'],
    queryFn: () => api.get('/firearms').then((r) => r.data),
  });

  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { firearmId: params.firearmId ?? '', intervalRounds: 500 as any },
  });

  const selectedFirearmId = watch('firearmId');

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/maintenance', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      router.back();
    },
    onError: (e: any) => {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to add task');
    },
  });

  const QUICK_TASKS = [
    { name: 'Clean barrel', interval: 500 },
    { name: 'Lubricate slide', interval: 500 },
    { name: 'Deep clean', interval: 1000 },
    { name: 'Inspect springs', interval: 2000 },
    { name: 'Replace recoil spring', interval: 5000 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Task</Text>
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

          <Text style={styles.label}>Quick Templates</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {QUICK_TASKS.map((t) => (
              <TouchableOpacity
                key={t.name}
                style={styles.templateChip}
                onPress={() => {
                  setValue('name', t.name);
                  setValue('intervalRounds', t.interval as any);
                }}
              >
                <Text style={styles.templateName}>{t.name}</Text>
                <Text style={styles.templateInterval}>{t.interval} rds</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.label}>Task Name *</Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                value={value}
                onChangeText={onChange}
                placeholder="e.g. Clean barrel"
              />
            )}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}

          <Text style={styles.label}>Every N Rounds *</Text>
          <Controller
            control={control}
            name="intervalRounds"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[styles.input, errors.intervalRounds && styles.inputError]}
                value={String(value)}
                onChangeText={onChange}
                keyboardType="numeric"
                placeholder="e.g. 500"
              />
            )}
          />
          {errors.intervalRounds && <Text style={styles.errorText}>{errors.intervalRounds.message}</Text>}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit((d) => mutation.mutate({ ...d, intervalRounds: parseInt(d.intervalRounds, 10) } as any))}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Add Task'}</Text>
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
  templateChip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, marginRight: 8, minWidth: 120 },
  templateName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  templateInterval: { fontSize: 11, color: '#999', marginTop: 2 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16 },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 2 },
  button: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
