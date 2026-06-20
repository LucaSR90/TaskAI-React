import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';

const priorities = ['Alta', 'Media', 'Baja'] as const;

type Priority = typeof priorities[number];

export default function CreateTaskScreen() {
  const router = useRouter();
  const { auth, db } = useFirebase();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('General');
  const [prioridad, setPrioridad] = useState<Priority>('Media');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!auth || !db) {
      setError('Firebase no está inicializado. Intenta más tarde.');
      return;
    }

    setError(null);

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError('Debes iniciar sesión para crear tareas.');
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, 'tasks'), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        categoria: categoria.trim(),
        prioridad,
        completada: false,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      router.replace('/');
    } catch (writeError) {
      const message = writeError instanceof Error
        ? writeError.message
        : 'No se pudo guardar la tarea. Intenta de nuevo.';
      Alert.alert('Error', message);
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crear nueva tarea</Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={titulo}
        onChangeText={setTitulo}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={categoria}
        onChangeText={setCategoria}
      />

      <View style={styles.priorityRow}>
        {priorities.map((option) => (
          <Pressable
            key={option}
            style={[styles.priorityButton, prioridad === option && styles.prioritySelected]}
            onPress={() => setPrioridad(option)}
          >
            <Text style={[styles.priorityText, prioridad === option && styles.priorityTextSelected]}>{option}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleCreate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Guardar</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  prioritySelected: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  priorityText: {
    color: '#111827',
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#b91c1c',
    marginBottom: 16,
    textAlign: 'center',
  },
});
