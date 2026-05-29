import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, ScrollView, 
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Modal 
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';
import { useAuth } from '@/src/features/auth/presentation/hooks/useAuth';
import * as Location from 'expo-location';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Estado para controlar el mapa selector modal
  const [mapModalVisible, setMapModalVisible] = useState(false);

  // Estados comunes del formulario
  const [name, setName] = useState(user?.name || '');
  const [documentId, setDocumentId] = useState(user?.document_id || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [latitude, setLatitude] = useState<number | null>(user?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(user?.longitude || null);

  // Estados específicos de Adoptante
  const [occupation, setOccupation] = useState(user?.occupation || '');
  const [experience, setExperience] = useState(user?.experience || 'primera');
  const [homeDesc, setHomeDesc] = useState(user?.home_description || '');
  const [certify, setCertify] = useState(false);

  // Sincronizar datos si cambian en el store
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDocumentId(user.document_id || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setLatitude(user.latitude || null);
      setLongitude(user.longitude || null);
      setOccupation(user.occupation || '');
      setExperience(user.experience || 'primera');
      setHomeDesc(user.home_description || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (user?.role === 'adoptante' && !certify) {
      Alert.alert('Aviso', 'Debes certificar que la información es verdadera.');
      return;
    }
    if (user?.role === 'refugio' && (!address || !latitude || !longitude)) {
      Alert.alert('Faltan Datos', 'Por favor ingresa la dirección y selecciona la ubicación en el mapa.');
      return;
    }

    setIsLoading(true);
    try {
      await updateUserProfile({
        name,
        document_id: documentId,
        phone,
        address,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        occupation: user?.role === 'adoptante' ? occupation : undefined,
        experience: user?.role === 'adoptante' ? experience : undefined,
        home_description: user?.role === 'adoptante' ? homeDesc : undefined,
      });
      Alert.alert('¡Éxito!', 'Perfil guardado y sincronizado correctamente.');
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
        
        var map = L.map('map').setView([initialLat, initialLng], 14);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19, attribution: '© OpenStreetMap'
        }).addTo(map);

        var marker;
        // Si ya existen coordenadas previas, pintar el pin inicial
        if (${latitude !== null && longitude !== null}) {
          marker = L.marker([initialLat, initialLng]).addTo(map).bindPopup("Ubicación Actual").openPopup();
        }

        // Escuchar el click en el mapa
        map.on('click', function(e) {
          if (marker) { map.removeLayer(marker); }
          marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          
          // Enviar las coordenadas de vuelta a la app de React Native
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

  const renderRadio = (value: string, label: string) => (
    <TouchableOpacity style={styles.radioContainer} onPress={() => setExperience(value)}>
      <View style={[styles.radioOuter, experience === value && styles.radioOuterActive]}>
        {experience === value && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Cabecera Condicional según el rol */}
        <View style={[styles.headerBadge, user?.role === 'refugio' ? styles.badgeRefugioBg : styles.badgeAdoptanteBg]}>
          <Text style={[styles.badgeText, user?.role === 'refugio' ? styles.badgeRefugioText : styles.badgeAdoptanteText]}>
            {user?.role === 'refugio' ? '🏠 Red de Refugios' : '👥 Candidato a Adoptante'}
          </Text>
        </View>

        <Text style={styles.title}>
          {user?.role === 'refugio' ? 'Información del Refugio' : 'Tu viaje comienza aquí'}
        </Text>
        <Text style={styles.subtitle}>
          {user?.role === 'refugio' 
            ? 'Mantén actualizados tus datos de contacto y ubicación GPS para los adoptantes.'
            : 'Completa tu perfil para que podamos ayudarte a encontrar a tu compañero ideal.'}
        </Text>

        <View style={styles.formContainer}>
          
          {/* ==================== FORMULARIO DE REFUGIO ==================== */}
          {user?.role === 'refugio' && (
            <>
              <Text style={styles.label}>Nombre del Refugio</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Refugio Huellas Felices" />

              <Text style={styles.label}>NIT / Identificación</Text>
              <TextInput style={styles.input} value={documentId} onChangeText={setDocumentId} placeholder="900.123.456-7" />

              <Text style={styles.label}>Dirección Física</Text>
              <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Calle 123 #45-67, Ciudad" />

              <Text style={styles.label}>Ubicación GPS Georreferenciada</Text>
              <TouchableOpacity 
                style={[styles.mapPickerButton, latitude ? styles.mapPickerButtonSuccess : null]} 
                onPress={() => setMapModalVisible(true)}
              >
                <Text style={[styles.mapPickerButtonText, latitude ? styles.mapPickerButtonTextSuccess : null]}>
                  {latitude ? `📍 Ubicación Seleccionada (${latitude.toFixed(4)}, ${longitude?.toFixed(4)})` : '🗺️ Seleccionar Ubicación en Mapa'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.mapHelpText}>Toca el botón para marcar la ubicación exacta en el mapa de OpenStreetMap.</Text>

              <Text style={styles.label}>Teléfono de Contacto</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+593 99 000 0000" />
            </>
          )}

          {/* ==================== FORMULARIO DE ADOPTANTE ==================== */}
          {user?.role === 'adoptante' && (
            <>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ej: Ana María García" />

              <Text style={styles.label}>Cédula / ID</Text>
              <TextInput style={styles.input} value={documentId} onChangeText={setDocumentId} placeholder="Ej: 1712345678" />

              <Text style={styles.label}>Ocupación / Profesión</Text>
              <TextInput style={styles.input} value={occupation} onChangeText={setOccupation} placeholder="¿A qué te dedicas?" />

              <Text style={styles.label}>Experiencia con mascotas</Text>
              {renderRadio('primera', 'Es mi primera mascota')}
              {renderRadio('anteriores', 'He tenido mascotas anteriormente')}
              {renderRadio('actuales', 'Actualmente tengo otras mascotas')}

              <Text style={styles.label}>Teléfono Móvil</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+593 99..." />

              <Text style={styles.label}>Cuéntanos sobre tu hogar</Text>
              <TextInput style={[styles.input, styles.textArea]} multiline numberOfLines={4} value={homeDesc} onChangeText={setHomeDesc} placeholder="Describe brevemente el entorno donde viviría la mascota..." />

              <TouchableOpacity style={styles.checkboxContainer} onPress={() => setCertify(!certify)}>
                <View style={[styles.checkbox, certify && styles.checkboxActive]}>
                  {certify && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxText}>Certifico que la información proporcionada es verdadera y acepto el compromiso de cuidado responsable.</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.label}>Correo Electrónico (No modificable)</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={user?.email} editable={false} />

          {/* Botón Principal Guardar Perfil */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.primaryButtonText}>Finalizar Registro</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ==================== MODAL MAPA SELECTOR (LEAFLET) ==================== */}
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
  
  headerBadge: { alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  badgeAdoptanteBg: { backgroundColor: '#D1FAE5' },
  badgeAdoptanteText: { color: '#065F46', fontWeight: 'bold' },
  badgeRefugioBg: { backgroundColor: '#E0F2FE' },
  badgeRefugioText: { color: '#0369A1', fontWeight: 'bold' },
  badgeText: { fontSize: 14 },
  
  title: { fontSize: 26, fontWeight: '900', color: '#111827', textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 32, lineHeight: 22, paddingHorizontal: 10 },
  formContainer: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  label: { fontSize: 14, color: '#374151', marginBottom: 8, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, backgroundColor: '#FFFFFF' },
  disabledInput: { backgroundColor: '#F3F4F6', color: '#9CA3AF' },
  textArea: { height: 100, textAlignVertical: 'top' },
  
  // Estilos del mapa selector
  mapPickerButton: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#0F766E', borderStyle: 'dashed', backgroundColor: '#F0FDFA', alignItems: 'center', marginBottom: 6 },
  mapPickerButtonSuccess: { backgroundColor: '#D1FAE5', borderColor: '#065F46', borderStyle: 'solid' },
  mapPickerButtonText: { color: '#0F766E', fontSize: 16, fontWeight: 'bold' },
  mapPickerButtonTextSuccess: { color: '#065F46' },
  mapHelpText: { fontSize: 12, color: '#6B7280', marginBottom: 20, paddingHorizontal: 4 },
  
  // Radios de Adoptante
  radioContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, marginBottom: 12 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  radioOuterActive: { borderColor: '#0F766E' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#0F766E' },
  radioText: { fontSize: 16, color: '#374151' },
  
  // Checkbox de Adoptante
  checkboxContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 24, marginTop: 10 },
  checkbox: { width: 24, height: 24, borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 6, marginRight: 12, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  checkboxActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  checkboxText: { fontSize: 14, color: '#4B5563', flex: 1, lineHeight: 20 },
  
  // Botones principales
  primaryButton: { backgroundColor: '#0F766E', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  
  // Modal de Mapa Picker
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  modalSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  closeButton: { backgroundColor: '#0F766E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  closeButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});