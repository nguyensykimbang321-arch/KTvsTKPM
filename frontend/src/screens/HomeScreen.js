import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, 
  TouchableOpacity, Image, TextInput, Alert, ActivityIndicator 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MapPin, Bell, Star, Clock, Sparkles, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme/theme';
import { bookingService } from '../services/api';
import BottomNav from '../components/BottomNav';

export default function HomeScreen({ route, navigation }) {
  const [allServices, setAllServices] = useState([]);
  const [categories, setCategories] = useState([{ id: 0, name: 'Tất cả' }]);
  const [staffs, setStaffs] = useState([{ id: 0, fullName: 'Mọi thợ' }]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState(0);
  const [selectedStaffId, setSelectedStaffId] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (categories.length > 0) {
      if (route.params?.filterCategory) {
        const cat = categories.find(c => c && c.name && c.name.includes(route.params.filterCategory));
        if (cat) setSelectedCatId(cat.id);
        else setSearchQuery(route.params.filterCategory);
      }
    }
  }, [route.params?.filterCategory, categories]);

  useEffect(() => {
    if (staffs.length > 0 && route.params?.filterStaffId) {
      setSelectedStaffId(route.params.filterStaffId);
    }
  }, [route.params?.filterStaffId, staffs]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [selectedCatId, selectedStaffId, searchQuery, allServices]);

  const fetchInitialData = async () => {
    try {
      const [servicesData, categoriesData, staffsData] = await Promise.all([
        bookingService.getServices(),
        bookingService.getCategories(),
        bookingService.getStaffs()
      ]);
      
      const formattedServices = servicesData.map(s => {
        const displayImg = (Array.isArray(s.imageUrl) && s.imageUrl.length > 0) 
          ? s.imageUrl[0] 
          : (typeof s.imageUrl === 'string' && s.imageUrl ? s.imageUrl : 'https://images.unsplash.com/photo-1599351431247-f577f5d38ed9?w=500');
          
        return {
          ...s,
          image: displayImg,
          duration: `${s.durationMinutes}m`
        };
      });

      setAllServices(formattedServices);
      setCategories([{ id: 0, name: 'Tất cả' }, ...categoriesData]);
      setStaffs([{ id: 0, fullName: 'Mọi thợ' }, ...staffsData]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let result = [...allServices];
    
    // Lọc theo Category
    if (selectedCatId !== 0) {
      result = result.filter(s => s.categoryId === selectedCatId);
    }
    
    // Lọc theo Chuyên gia (Nhân viên)
    if (selectedStaffId && selectedStaffId !== 0) {
      result = result.filter(s => 
        Array.isArray(s.staffSchedules) && s.staffSchedules.some(schedule => Number(schedule.staffId) === Number(selectedStaffId))
      );
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      result = result.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredServices(result);
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Chào buổi sáng 👋</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={theme.colors.primary} />
            <Text style={styles.locationText}>Hà Nội, Việt Nam</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('Notification')}>
          <Bell color={theme.colors.text} size={22} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color={theme.colors.textMuted} size={20} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Tìm dịch vụ..."
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Promo Card */}
        <TouchableOpacity style={styles.promoContainer} activeOpacity={0.9}>
          <LinearGradient colors={theme.colors.gradients.primary} style={styles.promoCard} start={{x:0, y:0}} end={{x:1, y:1}}>
            <View style={styles.promoContent}>
              <View style={styles.promoTag}><Text style={styles.promoTagText}>Ưu đãi 30%</Text></View>
              <Text style={styles.promoTitle}>Tỏa sáng ngay hôm nay!</Text>
              <Text style={styles.promoDesc}>Ưu đãi dành riêng cho lịch hẹn đầu tiên của bạn.</Text>
            </View>
            <View style={styles.promoVisual}>
               <Sparkles color="white" size={60} opacity={0.2} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục dịch vụ</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {categories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              onPress={() => setSelectedCatId(cat.id)}
              style={[styles.catBtn, selectedCatId === cat.id && styles.catBtnActive]}
            >
              <Text style={[styles.catText, selectedCatId === cat.id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Staff Filter */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Theo chuyên gia</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.staffFilterRow}>
          {staffs.map((staff) => (
            <TouchableOpacity 
              key={staff.id} 
              onPress={() => setSelectedStaffId(staff.id)}
              style={[styles.staffFilterBtn, selectedStaffId === staff.id && styles.staffFilterBtnActive]}
            >
              {staff.id !== 0 && (
                <Image 
                  source={{ uri: `https://i.pravatar.cc/150?u=${staff.id}` }} 
                  style={styles.staffFilterAvatar} 
                />
              )}
              <Text style={[styles.staffFilterText, selectedStaffId === staff.id && styles.staffFilterTextActive]}>
                {staff.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dịch vụ phổ biến</Text>
          <TouchableOpacity><Text style={styles.seeAll}>Xem tất cả</Text></TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
        ) : (
          filteredServices.map((service) => (
            <TouchableOpacity 
              key={service.id} 
              style={styles.serviceCard}
              onPress={() => navigation.navigate('Booking', { service })}
            >
              <Image source={{ uri: service.image }} style={styles.serviceImg} />
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHead}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.servicePath}>{service.Category?.name || 'Làm đẹp'}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>{parseInt(service.price).toLocaleString()}đ</Text>
                  <View style={styles.durationBox}>
                    <Clock size={12} color={theme.colors.textMuted} />
                    <Text style={styles.durationText}>{service.duration}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 },
  welcome: { fontSize: 14, color: theme.colors.textSecondary, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 15, fontWeight: '700', color: theme.colors.text, marginLeft: 4 },
  bellBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error, borderWidth: 2, borderColor: 'white' },
  
  searchContainer: { paddingHorizontal: 24, marginBottom: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 16, height: 52, borderRadius: 16 },
  searchInput: { marginLeft: 12, flex: 1, fontSize: 15, color: theme.colors.text },

  promoContainer: { paddingHorizontal: 24, marginBottom: 24 },
  promoCard: { borderRadius: 24, padding: 20, flexDirection: 'row', height: 160, overflow: 'hidden' },
  promoContent: { flex: 1, justifyContent: 'center' },
  promoTag: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  promoTagText: { color: 'white', fontSize: 11, fontWeight: '800' },
  promoTitle: { color: 'white', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  promoDesc: { color: 'white', opacity: 0.8, fontSize: 12 },
  promoVisual: { position: 'absolute', right: -10, bottom: -10 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  seeAll: { fontSize: 13, color: theme.colors.primary, fontWeight: '700' },

  catRow: { paddingLeft: 24, paddingRight: 12, marginBottom: 24 },
  catBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: '#F1F5F9', marginRight: 12 },
  catBtnActive: { backgroundColor: theme.colors.primary },
  catText: { fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary },
  catTextActive: { color: 'white' },
  
  staffFilterRow: { paddingLeft: 24, paddingRight: 12, marginBottom: 24 },
  staffFilterBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    backgroundColor: '#F1F5F9', 
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  staffFilterBtnActive: { backgroundColor: 'white', borderColor: theme.colors.primary, ...theme.shadows.soft },
  staffFilterAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  staffFilterText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  staffFilterTextActive: { color: theme.colors.primary },

  serviceCard: { flexDirection: 'row', backgroundColor: 'white', marginHorizontal: 24, padding: 12, borderRadius: 20, marginBottom: 16, ...theme.shadows.soft },
  serviceImg: { width: 90, height: 90, borderRadius: 16 },
  serviceInfo: { flex: 1, marginLeft: 16, justifyContent: 'space-between' },
  serviceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  serviceName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, flex: 1 },
  servicePath: { fontSize: 12, color: theme.colors.textMuted },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800', color: theme.colors.primary },
  durationBox: { flexDirection: 'row', alignItems: 'center' },
  durationText: { fontSize: 11, color: theme.colors.textMuted, marginLeft: 4 }
});
