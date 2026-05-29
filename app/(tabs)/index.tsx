import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, TouchableOpacity, 
  Modal, TextInput, Alert, ActivityIndicator, Image, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { MotiView } from 'moti';
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
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <MotiView 
        className="flex-row items-center justify-between px-6 py-6 pt-16 bg-white border-b border-slate-200 shadow-sm"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <View className="flex-1">
          <Text className="text-3xl font-bold text-slate-900">Mis Mascotas 🐕</Text>
          <Text className="text-sm text-slate-500 mt-1">Gestiona tus registros activos</Text>
        </View>
        <TouchableOpacity 
          className="bg-gradient-to-br from-red-500 to-red-600 px-4 py-2 rounded-lg shadow-md"
          onPress={handleLogout}
        >
          <Text className="text-white font-bold text-sm">Salir</Text>
        </TouchableOpacity>
      </MotiView>

      {isLoading && !modalVisible ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#14b8a6" />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, idx) => item.id || idx.toString()}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateX: -50 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 400, delay: index * 50 }}
            >
              <TouchableOpacity 
                activeOpacity={0.8}
                className="flex-row bg-white rounded-2xl overflow-hidden shadow-md border-l-4 border-teal-500"
              >
                {item.image_url ? (
                  <Image 
                    source={{ uri: item.image_url }} 
                    className="w-24 h-24 bg-slate-200"
                  />
                ) : (
                  <View className="w-24 h-24 bg-gradient-to-br from-teal-200 to-teal-300 justify-center items-center">
                    <Text className="text-3xl">🐾</Text>
                  </View>
                )}
                <View className="flex-1 p-4 justify-center">
                  <Text className="text-lg font-bold text-slate-900">{item.name}</Text>
                  <Text className="text-sm text-teal-600 font-semibold mt-1">
                    {item.species} • {item.age ? `${item.age} años` : 'Edad desc.'}
                  </Text>
                  <Text className="text-xs text-slate-500 mt-2 line-clamp-1">
                    {item.breed || 'Raza no especificada'}
                  </Text>
                </View>
                {user?.role === 'refugio' && (
                  <TouchableOpacity 
                    className="bg-red-50 px-4 justify-center"
                    onPress={() => handleDelete(item.id, item.name)}
                  >
                    <Text className="text-2xl">🗑️</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </MotiView>
          )}
          ListEmptyComponent={
            <MotiView 
              className="items-center justify-center py-20"
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <Text className="text-5xl mb-4">🐾</Text>
              <Text className="text-slate-500 text-lg font-semibold">No hay mascotas registradas</Text>
              <Text className="text-slate-400 text-sm mt-2">¡Agrega tu primera mascota para comenzar!</Text>
            </MotiView>
          }
        />
      )}

      {/* Botón Flotante */}
      {user?.role === 'refugio' && (
        <MotiView
          className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg justify-center items-center"
          from={{ scale: 0, rotate: '0deg' }}
          animate={{ scale: 1, rotate: '360deg' }}
          transition={{ type: 'spring', delay: 200 }}
          onPress={() => setModalVisible(true)}
        >
          <TouchableOpacity 
            className="w-full h-full justify-center items-center"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-white text-3xl font-bold">+</Text>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          className="flex-1 bg-slate-50"
        >
          {/* Modal Header */}
          <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-slate-200 pt-16">
            <Text className="text-2xl font-bold text-slate-900">Registrar Mascota</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text className="text-3xl text-slate-400">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
            
            {/* Image Picker */}
            <TouchableOpacity 
              onPress={pickImage}
              className="w-full h-40 rounded-2xl bg-gradient-to-br from-blue-100 to-teal-100 justify-center items-center mb-6 border-2 border-dashed border-blue-300 overflow-hidden"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <View className="items-center">
                  <Text className="text-4xl mb-2">📷</Text>
                  <Text className="text-blue-700 font-semibold">Subir Foto Principal</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text className="text-lg font-bold text-slate-900 mb-4">Información Básica</Text>
            
            <TextInput
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base mb-4 text-slate-900"
              placeholder="Nombre de la mascota (Ej. Luna)"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#9ca3af"
            />

            <View className="flex-row gap-4 mb-4">
              <TextInput
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900"
                placeholder="Especie"
                value={species}
                onChangeText={setSpecies}
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900"
                placeholder="Raza"
                value={breed}
                onChangeText={setBreed}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="flex-row gap-4 mb-4">
              <TextInput
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900"
                placeholder="Edad (años)"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                placeholderTextColor="#9ca3af"
              />
              <TextInput
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-900"
                placeholder="Tamaño"
                value={size}
                onChangeText={setSize}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <TextInput
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base mb-6 text-slate-900 h-24"
              placeholder="Descripción de la mascota"
              multiline
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#9ca3af"
              textAlignVertical="top"
            />

            <TouchableOpacity
              className={`w-full py-4 rounded-xl font-bold text-white text-lg ${
                isSubmitting 
                  ? 'bg-slate-400' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600'
              }`}
              onPress={handleSavePet}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg text-center">Guardar Mascota</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
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