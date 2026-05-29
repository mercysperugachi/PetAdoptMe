import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Modal, TextInput, Alert, ActivityIndicator, Image, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usePets } from '@/src/features/pets/presentation/hooks/usePets';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { CreatePetDTO } from '@/src/features/pets/domain/entities/Pet';
import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';

export default function ShelterDashboard() {
  const { pets, isLoading, loadAllPets, createPet, deletePet } = usePets();
  const user = useAuthStore((state) => state.user);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado del formulario
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('Perro');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [size, setSize] = useState('Mediano');
  const [description, setDescription] = useState('');

  const { logout } = useAuth();

  useEffect(() => {
    loadAllPets();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Salir', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error al salir', error.message);
            }
          } 
        }
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSavePet = async () => {
    if (!name || !species) {
      Alert.alert('Error', 'El nombre y la especie son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newPet: CreatePetDTO = {
        name,
        species,
        breed,
        age: age ? parseInt(age) : undefined,
        size,
        description,
        imageUri: imageUri || undefined,
      };

      await createPet(newPet);
      Alert.alert('¡Éxito!', 'Mascota registrada correctamente.');
      
      // Limpiar formulario y cerrar modal
      setName(''); setBreed(''); setAge(''); setDescription(''); setImageUri(null);
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error al guardar', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (petId: string, petName: string) => {
    Alert.alert(
      'Eliminar Registro',
      `¿Estás seguro de que deseas eliminar a ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => deletePet(petId) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mis Refugiados</Text>
          <Text style={styles.headerSubtitle}>Gestiona los registros activos</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {isLoading && !modalVisible ? (
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
                <Text style={styles.petDetails}>{item.species} • {item.age ? `${item.age} años` : 'Edad desc.'}</Text>
              </View>
              {user?.role === 'refugio' && (
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No hay mascotas registradas aún.</Text>
          }
        />
      )}

      {/* Botón Flotante para Agregar */}
      {user?.role === 'refugio' && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* MODAL DE REGISTRO */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Registro de Mascota</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            
            {/* Subida de Imagen */}
            <TouchableOpacity style={styles.imagePickerContainer} onPress={pickImage}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderIcon}>📷</Text>
                  <Text style={styles.imagePlaceholderText}>Subir Foto Principal</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Nombre de la mascota (Ej. Luna)"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1, { marginRight: 8 }]}
                placeholder="Especie (Perro/Gato)"
                value={species}
                onChangeText={setSpecies}
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Raza / Mezcla"
                value={breed}
                onChangeText={setBreed}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.flex1, { marginRight: 8 }]}
                placeholder="Edad (Años)"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, styles.flex1]}
                placeholder="Tamaño (P/M/G)"
                value={size}
                onChangeText={setSize}
              />
            </View>

            <Text style={styles.sectionTitle}>Historia y Personalidad</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Cuéntanos un poco sobre su llegada al refugio y su carácter..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleSavePet}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.primaryButtonText}>Guardar Registro</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => setModalVisible(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 24, 
    backgroundColor: '#FFFFFF', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6' 
  },
  logoutButton: {
    backgroundColor: '#FEE2E2', // red-100
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#B91C1C', // red-700
    fontWeight: 'bold',
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 16, gap: 12, paddingBottom: 100 },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#E5E7EB' },
  cardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 24 },
  cardInfo: { flex: 1, marginLeft: 16 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  petDetails: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  deleteButton: { padding: 12, backgroundColor: '#FEE2E2', borderRadius: 12 },
  deleteButtonText: { fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 16 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center', shadowColor: '#0F766E', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  fabText: { fontSize: 32, color: '#FFFFFF', fontWeight: '300', marginTop: -4 },
  
  // Modal Styles
  modalContainer: { flex: 1, backgroundColor: '#FAFAF9' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#134E4A' },
  closeText: { fontSize: 24, color: '#6B7280', fontWeight: 'bold' },
  modalContent: { padding: 24 },
  
  imagePickerContainer: { width: '100%', height: 200, backgroundColor: '#E0F2FE', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center', marginBottom: 24, overflow: 'hidden' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderIcon: { fontSize: 40, marginBottom: 8 },
  imagePlaceholderText: { color: '#0369A1', fontWeight: '600' },
  previewImage: { width: '100%', height: '100%' },
  
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F766E', marginBottom: 12, marginTop: 8 },
  row: { flexDirection: 'row', marginBottom: 12 },
  flex1: { flex: 1 },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#1F2937', marginBottom: 12 },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  primaryButton: { backgroundColor: '#0F766E', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: 'transparent', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#0F766E' },
  secondaryButtonText: { color: '#0F766E', fontSize: 16, fontWeight: 'bold' },
});