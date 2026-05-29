import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, 
  StyleSheet, Modal 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';
import { UserRole } from '@/src/features/auth/domain/entities/User';
import * as Location from 'expo-location';

export default function RegisterScreen() {
  const [role, setRole] = useState<UserRole>('adoptante');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos extra Refugio
  const [documentId, setDocumentId] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [terms, setTerms] = useState(false);

  // Control del modal del mapa
  const [mapModalVisible, setMapModalVisible] = useState(false);

  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password || !terms) {
      Alert.alert('Error', 'Completa los campos y acepta los términos');
      return;
    }

    if (role === 'refugio' && (!address || !latitude || !longitude)) {
      Alert.alert('Faltan Datos', 'Por favor ingresa la dirección y selecciona la ubicación en el mapa.');
      return;
    }

    setIsLoading(true);
    try {
      const extraData = role === 'refugio' ? { 
        document_id: documentId, 
        address, 
        phone,
        latitude: latitude || undefined,
        longitude: longitude || undefined
      } : {};
      
      await register(email, password, name, role, extraData);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // HTML interactivo de Leaflet para capturar coordenadas al hacer clic
  const pickerMapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>body { padding: 0; margin: 0; } #map { height: 100vh; width: 100vw; }</style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Centrado inicial en Quito
        var initialLat = ${latitude || -0.2103};
        var initialLng = ${longitude || -78.4890};
        
        var map = L.map('map').setView([initialLat, initialLng], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker;
        if (${latitude !== null && longitude !== null}) {
          marker = L.marker([initialLat, initialLng]).addTo(map).bindPopup("Ubicación Seleccionada").openPopup();
        }

        // Escuchar el click en el mapa
        map.on('click', function(e) {
          if (marker) { map.removeLayer(marker); }
          marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          
          var coords = { latitude: e.latlng.lat, longitude: e.latlng.lng };
          window.ReactNativeWebView.postMessage(JSON.stringify(coords));
        });
      </script>
    </body>
    </html>
  `;

  // Capturar los mensajes que envía el mapa web
  const handleMapMessage = (event: any) => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);
      if (coords.latitude && coords.longitude) {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerIcon}><Text style={styles.iconText}>🏠</Text></View>
        <Text style={styles.title}>{role === 'refugio' ? 'Une tu refugio a nuestra red' : 'Crear Cuenta'}</Text>
        <Text style={styles.subtitle}>{role === 'refugio' ? 'Ayúdanos a conectar más patitas con sus hogares.' : 'Únete a nuestra red de patitas'}</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity style={[styles.roleButton, role === 'adoptante' && styles.roleButtonActive]} onPress={() => setRole('adoptante')}>
            <Text style={[styles.roleText, role === 'adoptante' && styles.roleTextActive]}>Adoptante</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleButton, role === 'refugio' && styles.roleButtonActive]} onPress={() => setRole('refugio')}>
            <Text style={[styles.roleText, role === 'refugio' && styles.roleTextActive]}>Refugio</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>{role === 'refugio' ? 'Nombre del Refugio' : 'Tu Nombre Completo'}</Text>
          <TextInput style={styles.input} placeholder={role === 'refugio' ? "Ej. Refugio Huellas Felices" : "Ej. Juan Pérez"} value={name} onChangeText={setName} />

          {role === 'refugio' && (
            <>
              <Text style={styles.label}>NIT / Identificación</Text>
              <TextInput style={styles.input} placeholder="900.123.456-7" value={documentId} onChangeText={setDocumentId} />
              
              <Text style={styles.label}>Dirección</Text>
              <TextInput style={styles.input} placeholder="Calle 123 #45-67, Ciudad" value={address} onChangeText={setAddress} />

              <Text style={styles.label}>Ubicación GPS Georreferenciada</Text>
              <TouchableOpacity 
                style={[styles.mapPickerButton, latitude ? styles.mapPickerButtonSuccess : null]} 
                onPress={() => setMapModalVisible(true)}
              >
                <Text style={[styles.mapPickerButtonText, latitude ? styles.mapPickerButtonTextSuccess : null]}>
                  {latitude ? `📍 Ubicación Seleccionada` : '🗺️ Seleccionar Ubicación en Mapa'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.mapHelpText}>Toca el botón para marcar la ubicación exacta en el mapa.</Text>

              <Text style={styles.label}>Teléfono</Text>
              <TextInput style={styles.input} placeholder="+593 99 000 0000" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </>
          )}

          <Text style={styles.label}>Correo Electrónico</Text>
          <TextInput style={styles.input} placeholder="contacto@ejemplo.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          
          <Text style={styles.label}>Contraseña</Text>
          <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" secureTextEntry value={password} onChangeText={setPassword} />

          <TouchableOpacity style={styles.checkboxContainer} onPress={() => setTerms(!terms)}>
            <View style={[styles.checkbox, terms && styles.checkboxActive]}>
              {terms && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>Acepto los <Text style={styles.linkText}>Términos de Servicio</Text> y la <Text style={styles.linkText}>Política de Privacidad</Text>.</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton} onPress={handleRegister} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.linkText}>Inicia sesión aquí</Text></TouchableOpacity>
        </View>
      </ScrollView>

      {/* ==================== MODAL MAPA SELECTOR ==================== */}
      <Modal visible={mapModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Selecciona la Ubicación</Text>
            <Text style={styles.modalSubtitle}>Toca el mapa en el punto exacto de tu refugio</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={() => setMapModalVisible(false)}>
            <Text style={styles.closeButtonText}>Listo</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{ flex: 1 }}>
          <WebView
            source={{ html: pickerMapHtml }}
            onMessage={handleMapMessage}
            scrollEnabled={false}
          />
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
  headerIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 16 },
  iconText: { fontSize: 30 },
  title: { fontSize: 28, fontWeight: '900', color: '#111827', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 24, paddingHorizontal: 20 },
  roleContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', padding: 4, borderRadius: 12, marginBottom: 24 },
  roleButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  roleButtonActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  roleText: { fontWeight: '600', color: '#6B7280' },
  roleTextActive: { color: '#0F766E' },
  formContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '500' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 16, backgroundColor: '#FFFFFF' },
  
  // Estilos del mapa selector
  mapPickerButton: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#0F766E', borderStyle: 'dashed', backgroundColor: '#F0FDFA', alignItems: 'center', marginBottom: 6 },
  mapPickerButtonSuccess: { backgroundColor: '#D1FAE5', borderColor: '#065F46', borderStyle: 'solid' },
  mapPickerButtonText: { color: '#0F766E', fontSize: 16, fontWeight: 'bold' },
  mapPickerButtonTextSuccess: { color: '#065F46' },
  mapHelpText: { fontSize: 12, color: '#6B7280', marginBottom: 20, paddingHorizontal: 4 },

  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingRight: 20 },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
  checkboxActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  checkboxText: { fontSize: 14, color: '#4B5563', flex: 1 },
  linkText: { color: '#0F766E', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#0F766E', borderRadius: 16, padding: 16, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { color: '#4B5563' },

  // Modal Map
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  closeButton: { backgroundColor: '#0F766E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  closeButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});