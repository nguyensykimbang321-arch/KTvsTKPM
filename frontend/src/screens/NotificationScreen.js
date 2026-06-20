import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  Platform, ActivityIndicator, RefreshControl, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell, CheckCircle, CreditCard, Info, ArrowLeft,
  Trash2, XCircle, Clock
} from 'lucide-react-native';
import { theme } from '../theme/theme';
import { notificationService } from '../services/api';

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data);

      // Tự động đánh dấu tất cả là đã đọc khi người dùng mở xem
      if (data.some(n => !n.isRead)) {
        await notificationService.markAllAsRead();
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications(true);
  };

  const handleDeleteAll = () => {
    const performDelete = async () => {
      try {
        setLoading(true);
        await notificationService.deleteAll();
        setNotifications([]);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể xóa thông báo');
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Xóa thông báo',
        'Bạn có chắc chắn muốn xóa toàn bộ thông báo không?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa sạch', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const getNotificationConfig = (type) => {
    switch (type) {
      case 'booking_created':
        return { icon: Bell, bg: '#EEF2FF', color: '#6366F1' };
      case 'booking_confirmed':
        return { icon: CheckCircle, bg: '#ECFDF5', color: '#10B981' };
      case 'booking_completed':
        return { icon: CheckCircle, bg: '#ECFDF5', color: '#10B981' };
      case 'booking_cancelled':
        return { icon: XCircle, bg: '#FEF2F2', color: '#EF4444' };
      case 'payment_success':
        return { icon: CreditCard, bg: '#EEF2FF', color: '#6366F1' };
      case 'payment_refund':
        return { icon: CreditCard, bg: '#FEF3C7', color: '#F59E0B' };
      case 'reminder':
        return { icon: Clock, bg: '#FFF7ED', color: '#F97316' };
      default:
        return { icon: Info, bg: '#F1F5F9', color: '#64748B' };
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Vừa xong';
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;

      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${hours}:${minutes} ${day}/${month}`;
    } catch (e) {
      return '';
    }
  };

  const renderItem = ({ item }) => {
    const config = getNotificationConfig(item.type);
    const Icon = config.icon;

    return (
      <View style={[styles.notifCard, !item.isRead && styles.unreadCard]}>
        <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
          <Icon size={22} color={config.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.unreadText]}>
              {item.title}
            </Text>
            <Text style={styles.notifTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <Text style={styles.notifDesc}>{item.message}</Text>
        </View>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleDeleteAll}
          disabled={notifications.length === 0}
        >
          <Trash2
            color={notifications.length === 0 ? theme.colors.textMuted : theme.colors.error}
            size={20}
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Bell size={48} color={theme.colors.textMuted} />
              <Text style={styles.emptyText}>Hộp thư thông báo trống.</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 10 : 0,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    position: 'relative',
    ...theme.shadows.soft
  },
  unreadCard: {
    borderColor: '#E0E7FF',
    backgroundColor: '#FAF5FF', // Subtle background color highlight for unread
  },
  unreadText: {
    fontWeight: '800',
  },
  unreadDot: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1'
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1, paddingRight: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  notifTime: { fontSize: 10, color: theme.colors.textMuted },
  notifDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, color: theme.colors.textMuted, fontSize: 15, fontWeight: '500' }
});
