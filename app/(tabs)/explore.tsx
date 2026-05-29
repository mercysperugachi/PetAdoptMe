import { useAdoptions } from '@/src/features/adoptions/presentation/hooks/useAdoptions';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { usePets } from '@/src/features/pets/presentation/hooks/usePets';
import { MotiView } from 'moti';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter(); // 🔥 AGREGA ESTO AQUÍ
  const { pets, isLoading: loadingPets, loadAllPets } = usePets()
    usePets();

  const {
    applyForAdoption,
    isLoading: loadingAdoption,
  } = useAdoptions();

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadAllPets();
  }, []);

  const handleAdopt = (
    petId: string,
    shelterId: string,
    petName: string
  ) => {
    Alert.alert(
      'Solicitud de Adopción',
      `¿Deseas enviar una solicitud para adoptar a ${petName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Enviar Solicitud',
          onPress: async () => {
            try {
              await applyForAdoption(
                petId,
                shelterId
              );

              Alert.alert(
                '¡Éxito!',
                `Tu solicitud por ${petName} ha sido enviada.`
              );
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.message
              );
            }
          },
        },
      ]
    );
  };

  // SOLO ADOPTANTES
  if (user?.role !== 'adoptante') {
    return (
      <MotiView
        style={styles.notAllowedContainer}
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          type: 'timing',
          duration: 500,
        }}
      >
        <Text style={styles.emoji}>
          🐕
        </Text>

        <Text style={styles.notAllowedTitle}>
          Esta pantalla es para adoptantes
        </Text>

        <Text style={styles.notAllowedText}>
          Usa tu panel principal para
          gestionar tus propios registros.
        </Text>
      </MotiView>
    );
  }

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <MotiView
        style={styles.header}
        from={{
          opacity: 0,
          translateY: -20,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
        }}
        transition={{
          type: 'timing',
          duration: 600,
        }}
      >
        <Text style={styles.headerTitle}>
          Explorar 🔍
        </Text>

        <Text style={styles.headerSubtitle}>
          Encuentra a tu nuevo mejor amigo
        </Text>
      </MotiView>

      {/* LOADING */}
      {loadingPets ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#a855f7"
          />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, idx) =>
            item.id || idx.toString()
          }
          contentContainerStyle={
            styles.listContainer
          }
          renderItem={({ item, index }) => (
            <MotiView
              from={{
                opacity: 0,
                translateY: 50,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
              }}
              transition={{
                type: 'timing',
                duration: 400,
                delay: index * 100,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => router.push({ pathname: '/(pet)/[id]', params: { id: item.id } })}
              >

                {/* IMAGE */}
                {item.image_url ? (
                  <Image
                    source={{
                      uri: item.image_url,
                    }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.imageEmoji}>
                      🐾
                    </Text>
                  </View>
                )}

                {/* CONTENT */}
                <View style={styles.cardContent}>

                  <Text style={styles.petName}>
                    {item.name}
                  </Text>

                  <Text style={styles.petInfo}>
                    {item.species} •{' '}
                    {item.breed ||
                      'Mestizo'}
                  </Text>

                  <Text
                    style={styles.description}
                  >
                    {item.description}
                  </Text>

                  {/* BUTTON */}
                  <TouchableOpacity
                    style={[
                      styles.adoptButton,
                      loadingAdoption &&
                        styles.disabledButton,
                    ]}
                    onPress={() =>
                      handleAdopt(
                        item.id,
                        item.shelter_id,
                        item.name
                      )
                    }
                    disabled={
                      loadingAdoption
                    }
                  >
                    <Text
                      style={
                        styles.buttonText
                      }
                    >
                      💕 Adoptar
                    </Text>
                  </TouchableOpacity>

                </View>
              </TouchableOpacity>
            </MotiView>
          )}
          ListEmptyComponent={
            <MotiView
              style={styles.emptyContainer}
              from={{
                opacity: 0,
                scale: 0.8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                type: 'timing',
                duration: 500,
              }}
            >
              <Text style={styles.emptyEmoji}>
                🔍
              </Text>

              <Text style={styles.emptyTitle}>
                No hay mascotas disponibles
              </Text>

              <Text style={styles.emptyText}>
                Vuelve pronto para nuevas
                adopciones
              </Text>
            </MotiView>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingTop: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7',
    elevation: 4,
  },

  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#cbd5e1',
  },

  imagePlaceholder: {
    width: '100%',
    height: 190,
    backgroundColor: '#e9d5ff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageEmoji: {
    fontSize: 60,
  },

  cardContent: {
    padding: 20,
  },

  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  petInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9333ea',
    marginTop: 8,
  },

  description: {
    fontSize: 14,
    color: '#475569',
    marginTop: 12,
    lineHeight: 22,
  },

  adoptButton: {
    marginTop: 16,
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#94a3b8',
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },

  emptyEmoji: {
    fontSize: 50,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
  },

  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
  },

  notAllowedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
  },

  emoji: {
    fontSize: 60,
    marginBottom: 16,
  },

  notAllowedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
  },

  notAllowedText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
}); 