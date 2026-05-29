import { useAdoptions } from '@/src/features/adoptions/presentation/hooks/useAdoptions';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { usePets } from '@/src/features/pets/presentation/hooks/usePets';
import { MotiView } from 'moti';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

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
      `¿Deseas enviar una solicitud para adoptar a ${petName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Solicitud',
          onPress: async () => {
            try {
              await applyForAdoption(petId, shelterId);
              Alert.alert('¡Éxito!', `Tu solicitud por ${petName} ha sido enviada.`);
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
      <MotiView
        className="flex-1 justify-center items-center bg-gradient-to-b from-slate-50 to-purple-50"
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
      >
        <Text className="text-6xl mb-4">🐕</Text>
        <Text className="text-2xl font-bold text-slate-900 text-center">Esta pantalla es para adoptantes</Text>
        <Text className="text-slate-500 text-center mt-3 px-8">Usa tu panel principal para gestionar tus propios registros.</Text>
      </MotiView>
    );
  }

  return (
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-purple-50">
      {/* Header */}
      <MotiView
        className="px-6 py-4 pt-16 bg-white border-b border-slate-200"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Text className="text-3xl font-bold text-slate-900">Explorar 🔍</Text>
        <Text className="text-sm text-slate-500 mt-2">Encuentra a tu nuevo mejor amigo</Text>
      </MotiView>

      {loadingPets ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#a855f7" />
        </View>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item, idx) => item.id || idx.toString()}
          contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 100 }}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: index * 100 }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                className="bg-white rounded-3xl overflow-hidden shadow-lg border-l-4 border-purple-500"
              >
                {/* Image */}
                {item.image_url ? (
                  <Image
                    source={{ uri: item.image_url }}
                    className="w-full h-48 bg-slate-200"
                  />
                ) : (
                  <View className="w-full h-48 bg-gradient-to-br from-purple-200 to-pink-200 justify-center items-center">
                    <Text className="text-6xl">🐾</Text>
                  </View>
                )}

                {/* Content */}
                <View className="p-5 bg-gradient-to-br from-white to-purple-50">
                  <Text className="text-2xl font-bold text-slate-900">{item.name}</Text>
                  <Text className="text-base text-purple-600 font-semibold mt-2">
                    {item.species} • {item.breed || 'Mestizo'}
                  </Text>
                  <Text className="text-sm text-slate-600 mt-3 leading-5 line-clamp-2">
                    {item.description}
                  </Text>

                  {/* Button */}
                  <TouchableOpacity
                    className={`mt-4 py-3 rounded-xl font-bold ${
                      loadingAdoption
                        ? 'bg-slate-400'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-md'
                    }`}
                    onPress={() => handleAdopt(item.id, item.shelter_id, item.name)}
                    disabled={loadingAdoption}
                  >
                    <Text className="text-white font-bold text-center text-lg">
                      💕 Adoptar
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </MotiView>
          )}
          ListEmptyComponent={
            <MotiView
              className="items-center justify-center py-20"
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'timing', duration: 500 }}
            >
              <Text className="text-5xl mb-4">🔍</Text>
              <Text className="text-slate-600 text-lg font-semibold">No hay mascotas disponibles</Text>
              <Text className="text-slate-400 text-sm mt-2">Vuelve pronto para nuevas adopciones</Text>
            </MotiView>
          }
        />
      )}
    </View>
  );
}