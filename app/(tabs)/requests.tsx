import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAdoptions } from '@/src/features/adoptions/presentation/hooks/useAdoptions';
import { useAuthStore } from '@/src/features/auth/presentation/store/authStore';

export default function RequestsScreen() {
  const { requests, isLoading, loadRequests, updateStatus } = useAdoptions();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = (id: string, status: 'approved' | 'rejected') => {
    const actionName = status === 'approved' ? 'Aprobar' : 'Rechazar';
    Alert.alert(
      `${actionName} Solicitud`,
      `¿Estás seguro de que deseas ${actionName.toLowerCase()} esta adopción?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await updateStatus(id, status);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          } 
        }
      ]
    );
  };

  const renderStatus = (status: string) => {
    switch (status) {
      case 'approved': return <Text style={[styles.badge, styles.badgeApproved]}>Aprobada</Text>;
      case 'rejected': return <Text style={[styles.badge, styles.badgeRejected]}>Rechazada</Text>;
      default: return <Text style={[styles.badge, styles.badgePending]}>Pendiente</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Solicitudes</Text>
        <Text style={styles.headerSubtitle}>
          {user?.role === 'refugio' ? 'Bandeja de adopciones recibidas' : 'Estado de tus peticiones'}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.petName}>🐾 {item.pets?.name || 'Mascota'}</Text>
                {renderStatus(item.status)}
              </View>
              
              <Text style={styles.detailText}>
                {user?.role === 'refugio' ? `Solicitante: ${item.profiles?.name}` : `Refugio ID: ${item.shelter_id.substring(0,8)}...`}
              </Text>
              
              {/* 🔥 NUEVO: Mostrar datos de contacto del adoptante si la solicitud está aprobada */}
              {item.status === 'approved' && user?.role === 'refugio' && (
                <View style={styles.contactContainer}>
                  <Text style={styles.contactTitle}>Contacto para entrega:</Text>
                  <Text style={styles.contactText}>📞 {item.profiles?.phone || 'No registró teléfono'}</Text>
                  <Text style={styles.contactText}>✉️ {item.profiles?.email}</Text>
                </View>
              )}
              
              {user?.role === 'refugio' && item.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.button, styles.btnReject]} onPress={() => handleAction(item.id, 'rejected')}>
                    <Text style={styles.btnRejectText}>Rechazar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.btnApprove]} onPress={() => handleAction(item.id, 'approved')}>
                    <Text style={styles.btnApproveText}>Aprobar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tienes solicitudes activas.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingTop: 60, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  headerSubtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  listContainer: { padding: 16, gap: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  detailText: { fontSize: 15, color: '#4B5563', marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  badgePending: { backgroundColor: '#FEF3C7', color: '#D97706' },
  badgeApproved: { backgroundColor: '#D1FAE5', color: '#059669' },
  badgeRejected: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  button: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnReject: { backgroundColor: '#FEE2E2' },
  btnRejectText: { color: '#DC2626', fontWeight: 'bold' },
  btnApprove: { backgroundColor: '#0F766E' },
  btnApproveText: { color: '#FFFFFF', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#6B7280', fontSize: 16 },
  
  // Estilos del recuadro de contacto
  contactContainer: { marginTop: 8, padding: 12, backgroundColor: '#F0FDFA', borderRadius: 12, borderWidth: 1, borderColor: '#CCFBF1' },
  contactTitle: { color: '#0F766E', fontWeight: 'bold', marginBottom: 6, fontSize: 14 },
  contactText: { color: '#0F766E', fontSize: 14, marginBottom: 4 }
});