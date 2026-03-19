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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../../lib/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  caliber: z.string().min(1, 'Caliber is required'),
  serialNumber: z.string().optional(),
  notes: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function NewFirearmScreen() {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post('/firearms', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['firearms'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      router.back();
    },
    onError: (e: any) => {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to add firearm');
    },
  });

  const fields: { name: keyof FormData; label: string; required?: boolean; multiline?: boolean }[] = [
    { name: 'name', label: 'Name (e.g. "My Glock 17")', required: true },
    { name: 'make', label: 'Make (e.g. Glock)', required: true },
    { name: 'model', label: 'Model (e.g. 17)', required: true },
    { name: 'caliber', label: 'Caliber (e.g. 9mm)', required: true },
    { name: 'serialNumber', label: 'Serial Number (optional)' },
    { name: 'notes', label: 'Notes (optional)', multiline: true },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>New Firearm</Text>
          </View>

          {fields.map((f) => (
            <View key={f.name}>
              <Text style={styles.label}>{f.label}</Text>
              <Controller
                control={control}
                name={f.name}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, f.multiline && { height: 80 }, errors[f.name] && styles.inputError]}
                    value={value as string}
                    onChangeText={onChange}
                    multiline={f.multiline}
                  />
                )}
              />
              {errors[f.name] && <Text style={styles.errorText}>{errors[f.name]?.message as string}</Text>}
            </View>
          ))}

          <TouchableOpacity
            style={[styles.button, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit((d) => mutation.mutate(d))}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Add Firearm'}</Text>
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
  label: { fontSize: 13, color: '#666', marginBottom: 4, marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 14, fontSize: 16 },
  inputError: { borderColor: '#e74c3c' },
  errorText: { color: '#e74c3c', fontSize: 12, marginTop: 2 },
  button: { backgroundColor: '#1a1a1a', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
