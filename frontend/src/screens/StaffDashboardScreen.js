import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity, 
  Alert, ActivityIndicator, Platform, StatusBar, 
  RefreshControl, Dimensions, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Clock, Calendar as CalendarIcon, CheckCircle, 
  XCircle, ArrowLeft, Users, TrendingUp, AlertCircle, 
  Filter, ChevronRight 
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function StaffDashboardScreen({ navigation }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchStaffBookings();
  }, []);

  const fetchStaffBookings = async () => {
    try {
      const data = await bookingService.getMyBookings(); 
      setBookings(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách nhiệm vụ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStaffBookings();
  };

  // Tính toán số liệu thống kê
  const stats = {
    totalServed: bookings.filter(b => b.status === 'completed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    totalRevenue: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0)
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    Alert.alert(
      'Xác nhận',
      `Bạn muốn chuyển trạng thái lịch hẹn sang: ${newStatus === 'completed' ? 'Hoàn thành' : 'Đã hủy'}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: async () => {
            try {
              if (newStatus === 'completed') {
                await bookingService.complete(bookingId);
              } else if (newStatus === 'cancelled') {
                await bookingService.cancel(bookingId, 'Nhân viên hủy lịch');
              }
              fetchStaffBookings();
            } catch (error) {
              Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể cập nhật trạng thái');
            }
          }
        }
      ]
    );
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      await bookingService.confirm(bookingId);
      fetchStaffBookings();
    } catch (error) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể xác nhận lịch hẹn');
    }
  };

  const renderStatCard = (title, value, unit, icon, color, gradient) => {
    const Icon = icon;
    return (
      <LinearGradient colors={gradient} style={styles.statCard}>
        <View style={styles.statIconBox}>
          <Icon size={20} color="white" />
        </View>
        <View>
          <Text style={styles.statValue}>{value}{unit}</Text>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <View style={styles.cardMain}>
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {item.customer?.fullName?.charAt(0) || 'K'}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{item.customer?.fullName || 'Khách hàng'}</Text>
              <Text style={styles.phoneText}>{item.customer?.phone || 'Chưa có SĐT'}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: getStatusColor(item.status) + '20' }
          ]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.serviceRow}>
          <View style={styles.serviceIcon}>
            <Clock size={14} color={theme.colors.primary} />
          </View>
          <Text style={styles.serviceName}>{item.Service?.name}</Text>
          <View style={styles.dot} />
          <Text style={styles.priceText}>{parseInt(item.totalAmount).toLocaleString()}đ</Text>
        </View>

        <View style={styles.timeInfo}>
          <View style={styles.infoBox}>
            <CalendarIcon size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.bookingDate}</Text>
          </View>
          <View style={styles.infoBox}>
            <Clock size={14} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>{item.startTime.substring(0, 5)}</Text>
          </View>
        </View>
      </View>

      {/* Hành động */}
      {(item.status === 'pending' || item.status === 'draft') && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.confirmBtn]}
            onPress={() => handleConfirmBooking(item.id)}
          >
            <CheckCircle color="white" size={16} />
            <Text style={styles.confirmBtnText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
          >
            <XCircle color={theme.colors.error} size={16} />
            <Text style={styles.cancelBtnText}>Từ chối</Text>
          </TouchableOpacity>
        </View>
      )}

      {item.status === 'confirmed' && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => handleUpdateStatus(item.id, 'completed')}
          >
            <CheckCircle color="white" size={16} />
            <Text style={styles.completeBtnText}>Hoàn thành</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.cancelBtn]}
            onPress={() => handleUpdateStatus(item.id, 'cancelled')}
          >
            <XCircle color={theme.colors.error} size={16} />
            <Text style={styles.cancelBtnText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return theme.colors.primary;
      case 'completed': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      case 'pending': return theme.colors.warning;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.colors.gradients.premium} style={styles.topHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.whiteBackBtn}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Staff Dashboard</Text>
            <View style={{ width: 44 }} />
          </View>
          
          <View style={styles.statsRow}>
            {renderStatCard('Đã phục vụ', stats.totalServed, '', Users, '#10B981', ['#10B981', '#059669'])}
            {renderStatCard('Đang chờ', stats.pending + stats.confirmed, '', AlertCircle, '#F59E0B', ['#F59E0B', '#D97706'])}
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.filterSection}>
          <Text style={styles.sectionTitle}>Lịch hẹn hôm nay</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(status => (
              <TouchableOpacity 
                key={status}
                style={[styles.filterChip, filterStatus === status && styles.filterChipActive]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={[styles.filterText, filterStatus === status && styles.filterTextActive]}>
                  {status === 'all' ? 'Tất cả' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={filteredBookings}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <AlertCircle size={48} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Không tìm thấy lịch hẹn nào.</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topHeader: { paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  whiteBackBtn: { padding: 8 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  statCard: { width: (SCREEN_WIDTH - 50) / 2, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center' },
  statIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statValue: { color: 'white', fontSize: 18, fontWeight: '900' },
  statTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  
  content: { flex: 1, marginTop: -20, backgroundColor: '#F8FAFC', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingTop: 20 },
  filterSection: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  filterRow: { flexDirection: 'row', marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'white', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  filterChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  filterText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  filterTextActive: { color: 'white' },
  
  listContent: { padding: 20, paddingBottom: 40 },
  bookingCard: { backgroundColor: 'white', borderRadius: 24, padding: 16, marginBottom: 16, ...theme.shadows.soft },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  customerInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarInitial: { color: theme.colors.primary, fontSize: 18, fontWeight: '800' },
  customerName: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  phoneText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '800' },
  
  serviceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: '#F1F5F9', padding: 8, borderRadius: 12 },
  serviceIcon: { width: 24, height: 24, borderRadius: 6, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  serviceName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, flex: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.textMuted, marginHorizontal: 10 },
  priceText: { fontSize: 14, fontWeight: '800', color: theme.colors.primary },
  
  timeInfo: { flexDirection: 'row' },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  infoText: { marginLeft: 6, fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { flex: 1, height: 44, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  confirmBtn: { backgroundColor: theme.colors.primary, marginRight: 10 },
  confirmBtnText: { color: 'white', fontWeight: '700', marginLeft: 8 },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: '700', marginLeft: 8 },
  completeBtn: { backgroundColor: theme.colors.success, marginRight: 10 },
  completeBtnText: { color: 'white', fontWeight: '700', marginLeft: 8 },
  
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, color: theme.colors.textMuted, fontSize: 15, fontWeight: '500' }
});
