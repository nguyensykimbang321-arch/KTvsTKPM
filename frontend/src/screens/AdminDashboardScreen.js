import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Users, Scissors, Layers, BarChart3, 
  Settings, ArrowLeft, ChevronRight, TrendingUp 
} from 'lucide-react-native';
import { theme } from '../theme/theme';

export default function AdminDashboardScreen({ navigation }) {
  
  const stats = [
    { label: 'Doanh thu', value: '45.2M', icon: TrendingUp, color: '#10B981' },
    { label: 'Lịch hẹn', value: '128', icon: BarChart3, color: '#6366F1' },
  ];

  const menuItems = [
    { id: 'services', title: 'Quản lý Dịch vụ', icon: Scissors, color: '#F59E0B', count: '12', action: () => navigation.navigate('ManageServices') },
    { id: 'staff', title: 'Quản lý Nhân viên', icon: Users, color: '#3B82F6', count: '8', action: () => navigation.navigate('ManageStaff') },
    { id: 'categories', title: 'Quản lý Danh mục', icon: Layers, color: '#8B5CF6', count: '4', action: () => navigation.navigate('ManageCategories') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản trị hệ thống</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
        
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity 
            style={styles.statCard}
            onPress={() => navigation.navigate('Revenue')}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
              <TrendingUp color="#10B981" size={24} />
            </View>
            <Text style={styles.statValue}>45.2M</Text>
            <Text style={styles.statLabel}>Doanh thu</Text>
          </TouchableOpacity>

          <View style={styles.statCard}>
            <View style={[styles.iconCircle, { backgroundColor: '#6366F120' }]}>
              <BarChart3 color="#6366F1" size={24} />
            </View>
            <Text style={styles.statValue}>128</Text>
            <Text style={styles.statLabel}>Lịch hẹn</Text>
          </View>
        </View>

        {/* Management Menu */}
        <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>
        {menuItems.map(item => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.menuItem}
            onPress={item.action}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                <item.icon color="white" size={22} />
              </View>
              <View>
                <Text style={styles.menuText}>{item.title}</Text>
                <Text style={styles.menuSub}>{item.count} mục hiện có</Text>
              </View>
            </View>
            <ChevronRight color={theme.colors.textMuted} size={20} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity 
          style={[styles.menuItem, { marginTop: 20 }]}
          onPress={() => Alert.alert('Hệ thống', 'Phiên bản quản trị v1.0.2')}
        >
          <View style={styles.menuLeft}>
            <View style={[styles.menuIcon, { backgroundColor: '#64748B' }]}>
              <Settings color="white" size={22} />
            </View>
            <Text style={styles.menuText}>Cấu hình hệ thống</Text>
          </View>
          <ChevronRight color={theme.colors.textMuted} size={20} />
        </TouchableOpacity>

      </ScrollView>
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
  
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { 
    width: '48%', 
    backgroundColor: 'white', 
    padding: 20, 
    borderRadius: 24, 
    ...theme.shadows.soft,
    alignItems: 'center'
  },
  iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 22, fontWeight: '900', color: theme.colors.text },
  statLabel: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 16 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    backgroundColor: 'white', 
    borderRadius: 20, 
    marginBottom: 12,
    ...theme.shadows.soft
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  menuSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }
});
