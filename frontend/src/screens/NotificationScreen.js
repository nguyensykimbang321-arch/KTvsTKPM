import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, CheckCircle, CreditCard, Info, ArrowLeft, Trash2 } from 'lucide-react-native';
import { theme } from '../theme/theme';

export default function NotificationScreen({ navigation }) {
  const notifications = [
    { 
      id: '1', 
      title: 'Đã xác nhận lịch hẹn', 
      desc: 'Lịch hẹn cắt tóc của bạn lúc 14:00 hôm nay đã được thợ Alex Trần xác nhận.', 
      time: '10 phút trước',
      type: 'success',
      icon: CheckCircle
    },
    { 
      id: '2', 
      title: 'Thanh toán thành công', 
      desc: 'Giao dịch VNPAY cho đơn hàng #BK1029 đã hoàn tất.', 
      time: '1 giờ trước',
      type: 'payment',
      icon: CreditCard
    },
    { 
      id: '3', 
      title: 'Khuyến mãi đặc biệt', 
      desc: 'Giảm giá 20% cho tất cả dịch vụ Spa vào cuối tuần này. Đặt lịch ngay!', 
      time: '5 giờ trước',
      type: 'info',
      icon: Info
    }
  ];

  const renderItem = ({ item }) => (
    <View style={styles.notifCard}>
      <View style={[styles.iconBox, { backgroundColor: item.type === 'success' ? '#ECFDF5' : (item.type === 'payment' ? '#EEF2FF' : '#FEF3C7') }]}>
        <item.icon 
          size={22} 
          color={item.type === 'success' ? '#10B981' : (item.type === 'payment' ? '#6366F1' : '#F59E0B')} 
        />
      </View>
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifDesc}>{item.desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Trash2 color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      />
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
    ...theme.shadows.soft
  },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  notifTime: { fontSize: 10, color: theme.colors.textMuted },
  notifDesc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 }
});
