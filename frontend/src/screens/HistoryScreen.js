import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Alert, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Clock, ChevronRight, Scissors } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';
import BottomNav from '../components/BottomNav';

export default function HistoryScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await bookingService.getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (Platform.OS === 'web') {
      const reason = prompt('Vui lòng nhập lý do hủy lịch hẹn (Ví dụ: Tôi không có thời gian, Đổi lịch hẹn khác...):', 'Tôi không có thời gian');
      if (reason !== null) {
        cancelBooking(bookingId, reason || 'Tôi không có thời gian');
      }
    } else {
      Alert.alert(
        'Hủy lịch hẹn',
        'Vui lòng nhập lý do hủy:',
        [
          { text: 'Quay lại', style: 'cancel' },
          { text: 'Tôi không có thời gian', onPress: () => cancelBooking(bookingId, 'Tôi không có thời gian') },
          { text: 'Đổi lịch hẹn khác', onPress: () => cancelBooking(bookingId, 'Đổi lịch hẹn khác') },
          { text: 'Lý do khác', onPress: () => cancelBooking(bookingId, 'Lý do khác') }
        ],
        { cancelable: true }
      );
    }
  };

  const cancelBooking = async (bookingId, reason) => {
    try {
      await bookingService.refund(bookingId, reason);
      if (Platform.OS === 'web') {
        alert('Lịch hẹn đã được hủy và hoàn tiền thành công');
      } else {
        Alert.alert('Thành công', 'Lịch hẹn đã được hủy và hoàn tiền');
      }
      fetchBookings(); // Reload danh sách
    } catch (error) {
      if (Platform.OS === 'web') {
        alert(typeof error === 'string' ? error : 'Không thể hủy lịch hẹn');
      } else {
        Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể hủy lịch hẹn');
      }
      console.error(error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#3B82F6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      case 'pending': return '#F59E0B';
      default: return theme.colors.textMuted;
    }
  };

  const insets = useSafeAreaInsets();
  
  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('Booking', { service: item.Service })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.serviceInfo}>
          <View style={styles.iconBox}>
            <Scissors color={theme.colors.primary} size={20} />
          </View>
          <View>
            <Text style={styles.serviceName}>{item.Service?.name || 'Dịch vụ'}</Text>
            <Text style={styles.staffName}>Thợ: {item.staff?.fullName || 'Chưa gán'}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'confirmed' ? 'Đã xác nhận' : 
             item.status === 'completed' ? 'Hoàn thành' : 
             item.status === 'cancelled' ? 'Đã hủy' : 
             item.status === 'draft' ? 'Đang thanh toán' : 'Đang chờ'}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.dateTime}>
          <View style={styles.infoRow}>
            <Calendar size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.bookingDate}</Text>
          </View>
          <View style={[styles.infoRow, { marginLeft: 16 }]}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.startTime}</Text>
          </View>
        </View>
        <Text style={styles.price}>{parseInt(item.totalAmount).toLocaleString()}đ</Text>
      </View>

      {(item.status === 'pending' || item.status === 'confirmed') && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => handleCancelBooking(item.id)}
        >
          <Text style={styles.cancelBtnText}>Hủy lịch & Hoàn tiền</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lịch hẹn của tôi</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Bạn chưa có lịch hẹn nào.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, backgroundColor: 'white' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: theme.colors.text },
  card: { backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 16, ...theme.shadows.soft },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  serviceInfo: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  serviceName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  staffName: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  dateTime: { flexDirection: 'row' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoText: { fontSize: 13, color: theme.colors.textSecondary, marginLeft: 6 },
  price: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  cancelBtn: { 
    marginTop: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    backgroundColor: '#FEF2F2', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#FECACA',
    alignItems: 'center'
  },
  cancelBtnText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#EF4444'
  },
  emptyState: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyText: { color: theme.colors.textMuted, fontSize: 15 }
});
