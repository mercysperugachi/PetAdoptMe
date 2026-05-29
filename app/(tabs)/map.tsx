import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { useMap } from '@/src/features/maps/presentation/hooks/useMap';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MotiView } from 'moti';

export default function MapScreen() {
  const { locations, isLoading, loadLocations } = useMap();
  const user = useAuthStore((state) => state.user);
  const { updateUserProfile } = useAuth();

  const [currentLocation, setCurrentLocation] = useState({
    lat: -0.2103,
    lng: -78.489,
  });

  const [markedLocation, setMarkedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);

  const hasLoadedRef = useRef(false);

  // Obtener ubicación actual
  useEffect(() => {
    (async () => {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') return;

      const location = await Location.getCurrentPositionAsync({});

      setCurrentLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    })();
  }, []);

  // Cargar ubicación guardada
  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      setMarkedLocation({
        lat: user.latitude,
        lng: user.longitude,
      });
    }
  }, [user?.latitude, user?.longitude]);

  // Cargar refugios
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadLocations();
    }
  }, []);

  const handleMapMessage = (event: any) => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);

      if (coords.latitude && coords.longitude) {
        setMarkedLocation({
          lat: coords.latitude,
          lng: coords.longitude,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSaveLocation = async () => {
    if (!markedLocation) {
      Alert.alert(
        'Error',
        'Por favor marca una ubicación en el mapa'
      );
      return;
    }

    if (user?.role !== 'refugio') {
      Alert.alert(
        'Error',
        'Solo los refugios pueden guardar ubicación'
      );
      return;
    }

    setIsSaving(true);

    try {
      await updateUserProfile({
        latitude: markedLocation.lat,
        longitude: markedLocation.lng,
      });

      Alert.alert(
        'Éxito',
        'Ubicación guardada correctamente'
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo guardar la ubicación'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const mapInitialLat =
    markedLocation?.lat || currentLocation.lat;

  const mapInitialLng =
    markedLocation?.lng || currentLocation.lng;

  const sheltersMarkers = locations
    .filter((loc) => loc.latitude && loc.longitude)
    .map(
      (loc) => `
      L.marker([${loc.latitude}, ${loc.longitude}], {
        icon: L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      }).addTo(map)
      .bindPopup("<strong>${loc.name}</strong><br/>Refugio disponible");
    `
    )
    .join('\n');

  const mapHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />

    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

    <style>
      body {
        margin: 0;
        padding: 0;
      }

      #map {
        height: 100vh;
        width: 100vw;
      }
    </style>
  </head>

  <body>
    <div id="map"></div>

    <script>
      var map = L.map('map').setView(
        [${mapInitialLat}, ${mapInitialLng}],
        15
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }
      ).addTo(map);

      // Ubicación actual
      L.circleMarker(
        [${currentLocation.lat}, ${currentLocation.lng}],
        {
          color: '#2563eb',
          fillColor: '#2563eb',
          fillOpacity: 0.8,
          radius: 8
        }
      )
      .addTo(map)
      .bindPopup('Tu ubicación actual');

      var markedMarker;

      ${
        markedLocation
          ? `
        markedMarker = L.marker(
          [${mapInitialLat}, ${mapInitialLng}]
        ).addTo(map)
        .bindPopup('Tu ubicación guardada');
      `
          : ''
      }

      ${sheltersMarkers}

      ${
        user?.role === 'refugio'
          ? `
        map.on('click', function(e) {

          if (markedMarker) {
            map.removeLayer(markedMarker);
          }

          markedMarker = L.marker([
            e.latlng.lat,
            e.latlng.lng
          ]).addTo(map);

          window.ReactNativeWebView.postMessage(
            JSON.stringify({
              latitude: e.latlng.lat,
              longitude: e.latlng.lng
            })
          );
        });
      `
          : ''
      }
    </script>
  </body>
  </html>
  `;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <MotiView
        style={styles.header}
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 600,
        }}
      >
        <Text style={styles.title}>Mapa 🗺️</Text>

        <Text style={styles.subtitle}>
          {user?.role === 'refugio'
            ? 'Toca el mapa para guardar tu ubicación'
            : 'Encuentra refugios cercanos'}
        </Text>
      </MotiView>

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color="#16a34a"
          />
        </View>
      ) : (
        <>
          <View style={styles.mapContainer}>
            <WebView
              key={`${mapInitialLat}-${mapInitialLng}-${locations.length}`}
              source={{ html: mapHtml }}
              style={styles.map}
              onMessage={handleMapMessage}
            />
          </View>

          {user?.role === 'refugio' &&
            markedLocation && (
              <MotiView
                style={styles.bottomContainer}
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
                  duration: 300,
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    isSaving &&
                      styles.disabledButton,
                  ]}
                  onPress={handleSaveLocation}
                  disabled={isSaving}
                >
                  <Text style={styles.saveButtonText}>
                    {isSaving
                      ? 'Guardando...'
                      : 'Guardar Ubicación'}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            )}
        </>
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#0f172a',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  mapContainer: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

  bottomContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  saveButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  disabledButton: {
    backgroundColor: '#94a3b8',
  },

  saveButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});