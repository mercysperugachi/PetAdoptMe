import { useMap } from '@/src/features/maps/presentation/hooks/useMap';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapScreen() {
  const { locations, isLoading, loadLocations } = useMap();
  const [currentLocation, setCurrentLocation] = useState({ lat: -0.2103, lng: -78.4890 });

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

  // Generamos el HTML dinámico inyectando nuestra lista de refugios
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
        // Usamos la ubicación detectada por el dispositivo
        var initialLat = ${currentLocation.lat};
        var initialLng = ${currentLocation.lng};
        
        var map = L.map('map').setView([initialLat, initialLng], 15); // Zoom más cercano al usuario
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        // Opcional: Agregar un marcador azul de "Mi ubicación"
        var userMarker = L.circleMarker([initialLat, initialLng], {
        color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.8
        }).addTo(map).bindPopup("¡Estás aquí!").openPopup();

        var marker;
        // Lógica para el pin que el usuario elige (si ya tenía uno guardado)
        if (${currentLocation.lat !== null && currentLocation.lng !== null}) {
        marker = L.marker([${currentLocation.lat}, ${currentLocation.lng}]).addTo(map).bindPopup("Ubicación guardada");
        }

        map.on('click', function(e) {
        if (marker) { map.removeLayer(marker); }
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
        window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: e.latlng.lat, longitude: e.latlng.lng }));
        });
    </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mapa de Refugios</Text>
        <Text style={styles.headerSubtitle}>Encuentra el centro de adopción más cercano</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 50 }} />
      ) : (
        <View style={styles.mapContainer}>
          <WebView 
            // 🔴 AGREGAR ESTA KEY: obliga al componente a recargarse cuando currentLat cambia
            key={`${currentLocation.lat}-${currentLocation.lng}`} 
            source={{ html: mapHtml }} 
            style={styles.webview}
            scrollEnabled={false}
            />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  mapContainer: { flex: 1, overflow: 'hidden' },
  webview: { flex: 1, backgroundColor: 'transparent' }
});