import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { usePets } from '@/src/features/pets/presentation/hooks/usePets';
import { useAdoptions } from '@/src/features/adoptions/presentation/hooks/useAdoptions';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';

export default function ExploreScreen() {
  const { pets, isLoading: loadingPets, loadAllPets } = usePets();
  const { applyForAdoption, isLoading: loadingAdoption } = useAdoptions();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadAllPets();
  }, []);

  const handleAdopt = (petId: string, shelterId: string, petName: string) => {
    Alert.alert(
      'Solicitud de Adopción',
      `¿Deseas enviar una solicitud al refugio para adoptar a ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Solicitud',
          onPress: async () => {
            try {
              await applyForAdoption(petId, shelterId);
              Alert.alert('¡Éxito!', `Tu solicitud por ${petName} ha sido enviada al refugio.`);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (user?.role !== 'adoptante') {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Esta pantalla es para adoptantes.</Text>
        <Text style={styles.subtitleText}>Usa tu panel principal para gestionar tus propios registros.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar Mascotas</Text>
        <Text style={styles.headerSubtitle}>Encuentra a tu nuevo mejor amigo</Text>
      </View>

      {loadingPets ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImage} />
              ) : (
                <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
                  <Text style={styles.placeholderText}>🐾</Text>
                </View>
              )}
              <View style={styles.cardInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petDetails}>{item.species} • {item.breed || 'Mestizo'}</Text>
                <Text style={styles.petDescription} numberOfLines={2}>{item.description}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.adoptButton} 
                onPress={() => handleAdopt(item.id, item.shelter_id, item.name)}
                disabled={loadingAdoption}
              >
                <Text style={styles.adoptButtonText}>Adoptar</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay mascotas disponibles en este momento.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 20 },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 16, gap: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  cardImage: { width: '100%', height: 200, backgroundColor: '#E5E7EB' },
  cardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 60 },
  cardInfo: { padding: 16 },
  petName: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  petDetails: { fontSize: 15, color: '#0F766E', fontWeight: '600', marginTop: 4 },
  petDescription: { fontSize: 14, color: '#6B7280', marginTop: 8, lineHeight: 20 },
  adoptButton: { backgroundColor: '#0F766E', margin: 16, marginTop: 0, padding: 16, borderRadius: 12, alignItems: 'center' },
  adoptButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 18, fontWeight: 'bold' },
  subtitleText: { textAlign: 'center', marginTop: 8, color: '#9CA3AF', fontSize: 14 },
});