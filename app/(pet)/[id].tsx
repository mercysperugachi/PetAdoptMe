import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePetStore } from '@/src/features/pets/presentation/store/petStore';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { useAdoptions } from '@/src/features/adoptions/presentation/hooks/useAdoptions';
import { MaterialIcons } from '@expo/vector-icons';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  // Obtenemos los datos desde el estado global
  const pets = usePetStore((state) => state.pets);
  const user = useAuthStore((state) => state.user);
  const { applyForAdoption, isLoading: loadingAdoption } = useAdoptions();

  // Buscamos la mascota específica
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Mascota no encontrada.</Text>
        <TouchableOpacity style={styles.backButtonFallback} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAdopt = () => {
    Alert.alert(
      'Solicitud de Adopción',
      `¿Deseas enviar una solicitud al refugio para adoptar a ${pet.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Solicitud',
          onPress: async () => {
            try {
              await applyForAdoption(pet.id, pet.shelter_id);
              Alert.alert('¡Éxito!', `Tu solicitud por ${pet.name} ha sido enviada al refugio.`);
              router.back(); // Volvemos a la pantalla anterior tras el éxito
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
        {/* Cabecera con Imagen */}
        <View style={styles.imageContainer}>
          {pet.image_url ? (
            <Image source={{ uri: pet.image_url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderEmoji}>🐾</Text>
            </View>
          )}
          
          {/* Botón flotante para regresar */}
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Contenido de Detalles */}
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.petName}>{pet.name}</Text>
            <Text style={styles.petSpecies}>{pet.species}</Text>
          </View>

          <View style={styles.tagsContainer}>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>Raza</Text>
              <Text style={styles.tagValue}>{pet.breed || 'Mestizo'}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>Edad</Text>
              <Text style={styles.tagValue}>{pet.age ? `${pet.age} años` : 'Desc.'}</Text>
            </View>
            <View style={styles.tag}>
              <Text style={styles.tagLabel}>Tamaño</Text>
              <Text style={styles.tagValue}>{pet.size || 'Mediano'}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.descriptionText}>
            {pet.description || 'Esta hermosa mascota está esperando un hogar lleno de amor. Contáctate con el refugio para conocer más detalles sobre su personalidad y cuidados.'}
          </Text>
        </View>
      </ScrollView>

      {/* Botón inferior fijo para Adoptantes */}
      {user?.role === 'adoptante' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={[styles.adoptButton, loadingAdoption && styles.disabledButton]} 
            onPress={handleAdopt}
            disabled={loadingAdoption}
          >
            {loadingAdoption ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.adoptButtonText}>💕 Solicitar Adopción</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  errorText: { fontSize: 18, color: '#6B7280', marginBottom: 20 },
  backButtonFallback: { padding: 12, backgroundColor: '#0F766E', borderRadius: 8 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
  
  imageContainer: { width: '100%', height: 400, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  placeholderEmoji: { fontSize: 80 },
  
  backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  
  contentContainer: { padding: 24, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, minHeight: 400 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  petName: { fontSize: 32, fontWeight: '900', color: '#111827' },
  petSpecies: { fontSize: 16, color: '#0F766E', fontWeight: 'bold', backgroundColor: '#CCFBF1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, overflow: 'hidden' },
  
  tagsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  tag: { flex: 1, backgroundColor: '#F3F4F6', padding: 12, borderRadius: 16, alignItems: 'center', marginHorizontal: 4 },
  tagLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
  tagValue: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  descriptionText: { fontSize: 16, color: '#4B5563', lineHeight: 26, paddingBottom: 100 },
  
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingBottom: 40 },
  adoptButton: { backgroundColor: '#A855F7', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#A855F7', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  disabledButton: { backgroundColor: '#D1D5DB', shadowOpacity: 0 },
  adoptButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }
});