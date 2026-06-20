import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, DocumentData, onSnapshot, query, where } from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';
import { Task } from '../types';

const priorityOrder: Record<Task['prioridad'], number> = {
  Alta: 1,
  Media: 2,
  Baja: 3,
};

export default function IndexScreen() {
  const router = useRouter();
  const { auth, db } = useFirebase();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      }
    });

    return unsubscribeAuth;
  }, [router, auth]);

  useEffect(() => {
    if (!auth || !db) {
      setLoading(false);
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('userId', '==', currentUser.uid),
    );

    const unsubscribeTasks = onSnapshot(
      tasksQuery,
      (snapshot) => {
        const fetchedTasks: Task[] = snapshot.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          const createdAt = data.createdAt;
          const fechaCreacion = createdAt && typeof createdAt.toDate === 'function'
            ? createdAt.toDate().toISOString()
            : String(createdAt ?? data.fechaCreacion ?? '');

          return {
            id: doc.id,
            titulo: String(data.titulo ?? ''),
            descripcion: String(data.descripcion ?? ''),
            categoria: String(data.categoria ?? ''),
            prioridad: (data.prioridad as Task['prioridad']) ?? 'Media',
            fechaCreacion,
            completada: Boolean(data.completada ?? false),
          };
        });

        const sortedTasks = fetchedTasks.sort(
          (a, b) => priorityOrder[a.prioridad] - priorityOrder[b.prioridad],
        );

        setTasks(sortedTasks);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError.message || 'No se pudo cargar las tareas.');
        setLoading(false);
      },
    );

    return () => unsubscribeTasks();
  }, [auth, db]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Mis tareas</Text>
        <Pressable style={styles.addButton} onPress={() => router.push('/create')}>
          <Text style={styles.addButtonText}>Nueva</Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4f46e5" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <Text style={styles.taskTitle}>{item.titulo}</Text>
              <Text style={styles.taskMeta}>{item.categoria} · {item.prioridad}</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay tareas registradas.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  taskCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskMeta: {
    color: '#6b7280',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 32,
  },
  errorText: {
    color: '#b91c1c',
    textAlign: 'center',
    marginTop: 24,
  },
});
