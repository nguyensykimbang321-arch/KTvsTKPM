import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, DollarSign, ArrowLeft, Calendar as CalendarIcon, Filter } from 'lucide-react-native';
import { theme } from '../theme/theme';

export default function RevenueScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('Tháng');

  const summary = [
    { label: 'Tổng doanh thu', value: '45.280.000đ', icon: DollarSign, color: '#10B981' },
    { label: 'Số giao dịch', value: '1,248', icon: BarChart3, color: '#6366F1' },
  ];

  const transactions = [
    { id: '1', customer: 'Hoàng Nam', service: 'Cắt tóc + Gội', amount: '250.000đ', date: 'Hôm nay, 14:20' },
    { id: '2', customer: 'Thùy Chi', service: 'Nối mi Volume', amount: '450.000đ', date: 'Hôm nay, 12:05' },
    { id: '3', customer: 'Minh Tuấn', service: 'Massage body', amount: '600.000đ', date: 'Hôm qua, 18:30' },
    { id: '4', customer: 'Lê Anh', service: 'Com bo Cạo mặt', amount: '150.000đ', date: 'Hôm qua, 15:15' },
  ];

  const renderTransaction = ({ item }) => (
    <View style={styles.transCard}>
      <View style={styles.transLeft}>
        <View style={styles.transIcon}>
          <DollarSign size={20} color={theme.colors.success} />
        </View>
        <View>
          <Text style={styles.transCustomer}>{item.customer}</Text>
          <Text style={styles.transService}>{item.service}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.transAmount}>+{item.amount}</Text>
        <Text style={styles.transDate}>{item.date}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo doanh thu</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Filter color={theme.colors.text} size={22} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tabs Filter */}
        <View style={styles.tabContainer}>
          {['Ngày', 'Tuần', 'Tháng', 'Năm'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hero Stats */}
        <View style={styles.summaryGrid}>
          {summary.map((item, idx) => (
            <View key={idx} style={styles.summaryCard}>
              <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                <item.icon color={item.color} size={24} />
              </View>
              <Text style={styles.summaryVal}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
              <View style={styles.growthTag}>
                <TrendingUp size={12} color="#10B981" />
                <Text style={styles.growthText}>+12.5%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Charts Mockup - Professional Visuals */}
        <View style={styles.chartArea}>
          <Text style={styles.sectionTitle}>Biểu đồ tăng trưởng</Text>
          <View style={styles.chartMock}>
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <View key={i} style={[styles.chartBar, { height: h }]} />
            ))}
          </View>
          <View style={styles.chartLabels}>
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(l => (
              <Text key={l} style={styles.chartLabelText}>{l}</Text>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  
  tabContainer: { flexDirection: 'row', padding: 16, justifyContent: 'space-around' },
  tab: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  tabActive: { backgroundColor: theme.colors.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  tabTextActive: { color: 'white' },

  summaryGrid: { flexDirection: 'row', padding: 16, justifyContent: 'space-between' },
  summaryCard: { width: '48%', backgroundColor: 'white', borderRadius: 24, padding: 20, ...theme.shadows.soft },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  summaryVal: { fontSize: 18, fontWeight: '900', color: theme.colors.text },
  summaryLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  growthTag: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  growthText: { fontSize: 11, fontWeight: '700', color: '#10B981', marginLeft: 4 },

  chartArea: { margin: 16, backgroundColor: 'white', borderRadius: 24, padding: 20, ...theme.shadows.soft },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
  chartMock: { height: 120, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 10 },
  chartBar: { width: 30, backgroundColor: '#6366F1', borderRadius: 8 },
  chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingHorizontal: 10 },
  chartLabelText: { fontSize: 10, color: theme.colors.textMuted, fontWeight: '600' },

  recentContainer: { padding: 16 },
  transCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 20, marginBottom: 12, ...theme.shadows.soft },
  transLeft: { flexDirection: 'row', alignItems: 'center' },
  transIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transCustomer: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  transService: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  transAmount: { fontSize: 15, fontWeight: '800', color: theme.colors.success },
  transDate: { fontSize: 10, color: theme.colors.textMuted, marginTop: 4 }
});
