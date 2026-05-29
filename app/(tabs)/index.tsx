import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native';

import { MotiView } from 'moti';
import * as ImagePicker from 'expo-image-picker';

import { usePets } from '@/src/features/pets/presentation/hooks/usePets';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { CreatePetDTO } from '@/src/features/pets/domain/entities/Pet';
import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';

export default function ShelterDashboard() {
  const [editingId, setEditingId] = useState<string | null>(null);
  const { pets, isLoading, loadAllPets, createPet, deletePet,updatePet } = usePets();

  const user = useAuthStore((state) => state.user);

  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      '¿Deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSavePet = async () => {
    if (!name || !species) return Alert.alert('Error', 'Nombre y especie son obligatorios');
    setIsSubmitting(true);
    try {
      const petData: CreatePetDTO = {
        name, species, breed, age: age ? parseInt(age) : undefined,
        size, description, imageUri: imageUri || undefined,
      };

      if (editingId) {
        await updatePet(editingId, petData);
        Alert.alert('Éxito', 'Mascota actualizada');
      } else {
        await createPet(petData);
        Alert.alert('Éxito', 'Mascota registrada');
      }

      // Limpiar formulario
      setEditingId(null); setName(''); setBreed(''); setAge(''); setDescription(''); setImageUri(null);
      setModalVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (petId: string, petName: string) => {
    Alert.alert(
      'Eliminar',
      `¿Eliminar a ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePet(petId),
        },
      ]
    );
  };

  const handleEdit = (pet: any) => {
    setEditingId(pet.id);
    setName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed || '');
    setAge(pet.age ? pet.age.toString() : '');
    setSize(pet.size || '');
    setDescription(pet.description || '');
    setImageUri(pet.image_url || null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <MotiView
        style={styles.header}
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>
            Mis Mascotas 🐕
          </Text>

          <Text style={styles.subtitle}>
            Gestiona tus registros
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>
            Salir
          </Text>
        </TouchableOpacity>
      </MotiView>

      {/* LOADING */}
      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color="#0f766e"
          />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, idx) =>
            item.id || idx.toString()
          }
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <MotiView
              from={{
                opacity: 0,
                translateX: -40,
              }}
              animate={{
                opacity: 1,
                translateX: 0,
              }}
              transition={{
                delay: index * 50,
              }}
            >
              <View style={styles.card}>

                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={{ fontSize: 30 }}>
                      🐾
                    </Text>
                  </View>
                )}

                <View style={styles.cardInfo}>
                  <Text style={styles.petName}>
                    {item.name}
                  </Text>

                  <Text style={styles.petData}>
                    {item.species} •{' '}
                    {item.age
                      ? `${item.age} años`
                      : 'Edad desc.'}
                  </Text>

                  <Text style={styles.petBreed}>
                    {item.breed ||
                      'Raza no especificada'}
                  </Text>
                </View>

                {user?.role === 'refugio' && (
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleEdit(item)}
                    >
                      <Text style={{ fontSize: 24 }}>✏️</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item.id, item.name)}
                    >
                      <Text style={{ fontSize: 24 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </MotiView>
          )}
        />
      )}

      {/* FAB */}
      {user?.role === 'refugio' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() =>
            setModalVisible(true)
          }
        >
          <Text style={styles.fabText}>
            +
          </Text>
        </TouchableOpacity>
      )}

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
      >
        <KeyboardAvoidingView
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : 'height'
          }
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Registrar Mascota
            </Text>

            <TouchableOpacity
              onPress={() =>
                setModalVisible(false)
              }
            >
              <Text style={{ fontSize: 30 }}>
                ✕
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={
              styles.modalContent
            }
          >
            <TouchableOpacity
              style={styles.imagePicker}
              onPress={pickImage}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.preview}
                />
              ) : (
                <>
                  <Text style={{ fontSize: 40 }}>
                    📷
                  </Text>
                  <Text>
                    Subir Foto
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Nombre"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Especie"
              value={species}
              onChangeText={setSpecies}
            />

            <TextInput
              style={styles.input}
              placeholder="Raza"
              value={breed}
              onChangeText={setBreed}
            />

            <TextInput
              style={styles.input}
              placeholder="Edad"
              keyboardType="numeric"
              value={age}
              onChangeText={setAge}
            />

            <TextInput
              style={styles.input}
              placeholder="Tamaño"
              value={size}
              onChangeText={setSize}
            />

            <TextInput
              style={[
                styles.input,
                styles.textArea,
              ]}
              placeholder="Descripción"
              multiline
              value={description}
              onChangeText={
                setDescription
              }
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSavePet}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveText}>
                  Guardar Mascota
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 4,
    color: '#64748b',
  },

  logoutButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: {
    padding: 16,
    paddingBottom: 100,
  },

  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
  },

  image: {
    width: 100,
    height: 100,
  },

  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#99f6e4',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardInfo: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
  },

  petName: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  petData: {
    color: '#0f766e',
    marginTop: 4,
  },

  petBreed: {
    color: '#64748b',
    marginTop: 6,
  },

  deleteButton: {
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 999,
    backgroundColor: '#0f766e',
    justifyContent: 'center',
    alignItems: 'center',
  },

  fabText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  modalContent: {
    padding: 20,
  },

  imagePicker: {
    height: 180,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },

  preview: {
    width: '100%',
    height: '100%',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  editarButton:{justifyContent: 'center',
    paddingHorizontal: 16,
  }
});