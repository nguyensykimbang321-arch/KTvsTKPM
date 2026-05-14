import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, ImageBackground, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, TrendingUp, Sparkles, ArrowLeft } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';

export default function ExploreScreen({ navigation }) {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      const data = await bookingService.getStaffs();
      setExperts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chuyên gia:', error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý khi chọn danh mục
  const handleCategoryPress = (categoryName) => {
    // Quay về Home và truyền tham số category để lọc
    navigation.navigate('Home', { filterCategory: categoryName });
  };

  // Hàm xử lý khi chọn chuyên gia
  const handleStaffPress = (staffId) => {
    navigation.navigate('Home', { filterStaffId: staffId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.title}>Khám phá xu hướng</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24 }}>
        
        {/* Trending Card */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600' }} 
          style={styles.featuredCard}
          imageStyle={{ borderRadius: 32 }}
        >
          <View style={styles.overlay}>
            <View style={styles.trendingTag}>
              <TrendingUp color="white" size={14} />
              <Text style={styles.trendingText}>Xu hướng 2024</Text>
            </View>
            <Text style={styles.featuredTitle}>Tóc màu Pastel {"\n"}& Nano Curled</Text>
            <TouchableOpacity 
              style={styles.discoverBtn} 
              onPress={() => Alert.alert('Hot Trend', 'Dịch vụ này đang giảm giá 40% cho thành viên mới!')}
            >
              <Text style={styles.discoverBtnText}>Khám phá ngay</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        {/* Categories Grid */}
        <Text style={styles.sectionTitle}>Chuyên mục nổi bật</Text>
        <View style={styles.grid}>
          {[
            { name: 'Cắt tóc', icon: Sparkles, color: '#EEF2FF' },
            { name: 'Trang điểm', icon: Sparkles, color: '#FFF7ED' },
            { name: 'Làm móng', icon: Sparkles, color: '#F0FDF4' },
            { name: 'Spa', icon: Sparkles, color: '#FAF5FF' },
            { name: 'Uốn/Nhuộm', icon: Sparkles, color: '#FFF1F2' },
            { name: 'Massage', icon: Sparkles, color: '#ECFEFF' },
          ].map((item, idx) => (
            <TouchableOpacity 
              key={item.name} 
              style={styles.gridItem}
              onPress={() => handleCategoryPress(item.name)}
            >
              <View style={[styles.gridIcon, { backgroundColor: item.color }]}>
                <item.icon color={theme.colors.primary} size={24} />
              </View>
              <Text style={styles.gridLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Experts */}
        <Text style={styles.sectionTitle}>Các chuyên gia hàng đầu</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.expertRow}>
            {experts.map(expert => (
              <TouchableOpacity 
                key={expert.id} 
                style={styles.expertCard}
                onPress={() => handleStaffPress(expert.id)}
              >
                <Image source={{ uri: `https://i.pravatar.cc/150?u=${expert.id}` }} style={styles.expertAvatar} />
                <Text style={styles.expertName}>{expert.fullName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.text },

  featuredCard: { height: 260, marginBottom: 32, ...theme.shadows.medium },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 32, padding: 24, justifyContent: 'flex-end' },
  trendingTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
  trendingText: { color: 'white', marginLeft: 6, fontSize: 11, fontWeight: '700' },
  featuredTitle: { color: 'white', fontSize: 24, fontWeight: '800', lineHeight: 32, marginBottom: 16 },
  discoverBtn: { backgroundColor: 'white', alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  discoverBtnText: { color: theme.colors.text, fontWeight: '700', fontSize: 13 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridItem: { width: '30%', alignItems: 'center', marginBottom: 24 },
  gridIcon: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  gridLabel: { fontSize: 13, fontWeight: '600', color: theme.colors.text },

  expertRow: { marginLeft: -8, paddingBottom: 40 },
  expertCard: { alignItems: 'center', marginHorizontal: 12 },
  expertAvatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 12 },
  expertName: { fontSize: 14, fontWeight: '700', color: theme.colors.text }
});
