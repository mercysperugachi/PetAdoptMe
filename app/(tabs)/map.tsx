import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { useMap } from '@/src/features/maps/presentation/hooks/useMap';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const { locations, isLoading, loadLocations } = useMap();
  const user = useAuthStore((state) => state.user);
  const { updateUserProfile } = useAuth();
  
  const [currentLocation, setCurrentLocation] = useState({ lat: -0.2103, lng: -78.4890 });
  const [markedLocation, setMarkedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Ref para evitar llamadas múltiples a loadLocations
  const hasLoadedRef = useRef(false);

  // Efecto 1: Cargar ubicación actual del dispositivo
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    })();
  }, []);

  // Efecto 2: Cargar ubicación guardada del usuario
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setMarkedLocation({
        lat: user.latitude,
        lng: user.longitude
      });
    }
  }, [user?.latitude, user?.longitude]);

  // Efecto 3: Cargar refugios solo una vez
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadLocations();
    }
  }, []);

  // Capturar la ubicación marcada en el mapa
  const handleMapMessage = (event: any) => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);
      if (coords.latitude && coords.longitude) {
        setMarkedLocation({
          lat: coords.latitude,
          lng: coords.longitude
        });
      }
    } catch (err) {
      console.error('Error parsing map message:', err);
    }
  };

  // Guardar la ubicación marcada en el servidor
  const handleSaveLocation = async () => {
    if (!markedLocation) {
      Alert.alert('Error', 'Por favor marca una ubicación en el mapa');
      return;
    }
    
    if (user?.role !== 'refugio') {
      Alert.alert('Error', 'Solo los refugios pueden guardar ubicación');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserProfile({
        latitude: markedLocation.lat,
        longitude: markedLocation.lng,
      });
      Alert.alert('¡Éxito!', 'Ubicación guardada correctamente');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo guardar la ubicación');
    } finally {
      setIsSaving(false);
    }
  };

  // Generamos el HTML dinámico inyectando nuestra lista de refugios
  const mapInitialLat = markedLocation?.lat || currentLocation.lat;
  const mapInitialLng = markedLocation?.lng || currentLocation.lng;
  
  // Generar marcadores para los refugios
  const sheltersMarkers = locations
    .filter(loc => loc.latitude && loc.longitude)
    .map(loc => 
      `L.marker([${loc.latitude}, ${loc.longitude}], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map).bindPopup("<strong>${loc.name}</strong><br/>Refugio disponible");`
    )
    .join('\n');
  
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { padding: 0; margin: 0; }
            #map { height: 100vh; width: 100vw; }
        </style>
        </head>
        <body>
        <div id="map"></div>
        <script>
        // Usamos la ubicación guardada del usuario o la actual
        var initialLat = ${mapInitialLat};
        var initialLng = ${mapInitialLng};
        
        var map = L.map('map').setView([initialLat, initialLng], 15); // Zoom más cercano al usuario
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        // Mostrar ubicación actual en azul
        var userMarker = L.circleMarker([${currentLocation.lat}, ${currentLocation.lng}], {
        color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.8, radius: 8
        }).addTo(map).bindPopup("Tu ubicación actual");

        var markedMarker;
        // Si el usuario ya tiene ubicación guardada, mostrar un marcador diferente
        if (${markedLocation !== null}) {
          markedMarker = L.marker([${mapInitialLat}, ${mapInitialLng}], {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }).addTo(map).bindPopup("Tu ubicación guardada");
        }

        // Mostrar todos los refugios disponibles en verde
        ${sheltersMarkers}

        // Permitir al refugio marcar su ubicación
        ${user?.role === 'refugio' ? `
          map.on('click', function(e) {
            if (markedMarker) { map.removeLayer(markedMarker); }
            markedMarker = L.marker([e.latlng.lat, e.latlng.lng], {
              icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            }).addTo(map);
            window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
          });
        ` : ''}
    </script>
    </body>
    </html>
  `;

  return (
    <View className="flex-1 bg-gradient-to-b from-slate-50 to-green-50">
      {/* Header */}
      <MotiView
        className="px-6 py-4 pt-16 bg-white border-b border-slate-200"
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 600 }}
      >
        <Text className="text-3xl font-bold text-slate-900">Mapa 🗺️</Text>
        <Text className="text-sm text-slate-500 mt-2">
          {user?.role === 'refugio' 
            ? 'Haz click para marcar tu ubicación' 
            : 'Encuentra el centro de adopción más cercano'}
        </Text>
      </MotiView>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : (
        <>
          <View className="flex-1 overflow-hidden">
            <WebView 
              key={`${mapInitialLat}-${mapInitialLng}-${locations.length}`}
              source={{ html: mapHtml }} 
              className="flex-1"
              scrollEnabled={false}
              onMessage={handleMapMessage}
            />
          </View>
          
          {/* Botón para guardar ubicación */}
          {user?.role === 'refugio' && markedLocation && (
            <MotiView
              className="px-4 py-3 bg-white border-t border-slate-200"
              from={{ opacity: 0, translateY: 50 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300 }}
            >
              <TouchableOpacity
                className={`py-4 rounded-xl font-bold ${
                  isSaving
                    ? 'bg-slate-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg'
                }`}
                onPress={handleSaveLocation}
                disabled={isSaving}
              >
                <Text className="text-white font-bold text-lg text-center">
                  {isSaving ? '⏳ Guardando...' : '✓ Guardar Ubicación'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </>
      )}
    </View>
  );
}