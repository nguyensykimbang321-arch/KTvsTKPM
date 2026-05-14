import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  StyleSheet, View, Text, ScrollView, 
  TouchableOpacity, Image, Platform, Alert, ActivityIndicator, Animated, FlatList, Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { PremiumButton } from '../components/Common';
import { StatusBar } from 'expo-status-bar';
import { bookingService } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLOTS = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DAY_MAP = { 0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT' };

// Tạo danh sách 14 ngày kể từ hôm nay
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dateObj: d,
      dateStr: d.toISOString().split('T')[0],
      day: d.getDate(),
      dayLabel: DAY_LABELS[d.getDay()],
      dayOfWeek: DAY_MAP[d.getDay()],
      isToday: i === 0
    });
  }
  return dates;
};

export default function BookingScreen({ route, navigation }) {
  const { service } = route.params;
  const availableDates = useMemo(() => generateDates(), []);
  
  const [selectedDate, setSelectedDate] = useState(availableDates[0]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busySlots, setBusySlots] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const parseTime = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const isSlotPast = (slot) => {
    if (!selectedDate.isToday) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return parseTime(slot) <= currentMinutes;
  };

  const isSlotBusy = (slot) => {
    const duration = service.durationMinutes || (typeof service.duration === 'number' ? service.duration : parseInt(service.duration, 10)) || 60;
    const slotStart = parseTime(slot);
    const slotEnd = slotStart + duration;

    return busySlots.some(({ startTime, endTime }) => {
      const busyStart = parseTime(startTime);
      const busyEnd = parseTime(endTime);
      return slotStart < busyEnd && slotEnd > busyStart;
    });
  };

  // Lọc danh sách chuyên gia theo ngày đã chọn (dựa trên staffSchedules)
  const filteredStaffs = useMemo(() => {
    if (!service.staffSchedules || !Array.isArray(service.staffSchedules)) return staffs;
    
    const staffIdsForDay = new Set();
    service.staffSchedules.forEach(schedule => {
      if (schedule.dayOfWeek === selectedDate.dayOfWeek) {
        staffIdsForDay.add(schedule.staffId);
      }
    });

    if (staffIdsForDay.size === 0) return [];
    return staffs.filter(s => staffIdsForDay.has(s.id));
  }, [selectedDate, staffs, service.staffSchedules]);

  // Lấy mảng ảnh từ service data
  const images = Array.isArray(service.imageUrl) && service.imageUrl.length > 0 
    ? service.imageUrl 
    : [service.image || 'https://images.unsplash.com/photo-1599351431247-f577f5d38ed9?w=500'];

  // Animation Setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const translateYAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    fetchStaffs();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(translateYAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true })
    ]).start();

    if (images.length > 1) {
      startTimer();
    }
    return () => stopTimer();
  }, [activeImageIndex]);

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      let nextIndex = activeImageIndex + 1;
      if (nextIndex >= images.length) nextIndex = 0;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveImageIndex(nextIndex);
    }, 3000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Khi chọn ngày mới → reset chuyên gia và giờ
  useEffect(() => {
    setSelectedStaff(null);
    setSelectedSlot(null);
    setBusySlots([]);
  }, [selectedDate]);

  // Khi danh sách chuyên gia theo ngày thay đổi → tự động chọn người đầu tiên
  useEffect(() => {
    if (filteredStaffs.length > 0) {
      setSelectedStaff(filteredStaffs[0].id);
    }
  }, [filteredStaffs]);

  // Khi chọn chuyên gia mới → reset giờ và tải lại busySlots
  useEffect(() => {
    if (selectedStaff) {
      setSelectedSlot(null);
      fetchBusySlots();
    }
  }, [selectedStaff, selectedDate]);

  const fetchBusySlots = async () => {
    try {
      const data = await bookingService.getBusySlots(selectedStaff, selectedDate.dateStr);
      setBusySlots(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStaffs = async () => {
    try {
      const data = await bookingService.getStaffs(service.id);
      const formatted = data.map(s => ({
        id: s.id,
        name: s.fullName,
        role: 'Chuyên gia',
        avatar: `https://i.pravatar.cc/150?u=${s.id}`
      }));
      setStaffs(formatted);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImageIndex(Math.round(index));
  };

  const handleBooking = () => {
    if (!selectedStaff || !selectedSlot) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày, chuyên gia và giờ hẹn');
      return;
    }
    const bookingData = {
      service,
      staff: staffs.find(s => s.id === selectedStaff),
      slot: selectedSlot,
      date: selectedDate.dateStr
    };
    navigation.navigate('Payment', { bookingData });
  };

  // Format tháng hiển thị
  const currentMonth = selectedDate.dateObj.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft color={theme.colors.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.title}>Chi tiết dịch vụ</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <Animated.View style={[
            styles.heroSection, 
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }, { translateY: translateYAnim }] }
          ]}>
            {/* Image Slider */}
            <View style={styles.carouselContainer}>
              <FlatList
                ref={flatListRef}
                horizontal
                snapToInterval={SCREEN_WIDTH - 50}
                snapToAlignment="center"
                decelerationRate="fast"
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                onScrollBeginDrag={stopTimer}
                onScrollEndDrag={startTimer}
                data={images}
                keyExtractor={(item, index) => index.toString()}
                contentContainerStyle={{ paddingHorizontal: 25 }}
                renderItem={({ item }) => (
                  <View style={styles.imageWrapper}>
                    <Image source={{ uri: item }} style={styles.carouselImg} />
                  </View>
                )}
              />
              {images.length > 1 && (
                <View style={styles.pagination}>
                  {images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeImageIndex && styles.activeDot]} />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description || 'Dịch vụ chất lượng cao với các chuyên gia hàng đầu trong ngành.'}</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Clock size={16} color={theme.colors.primary} />
                  <Text style={styles.statText}>{service.duration || (service.durationMinutes + 'm')}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* BƯỚC 1: Chọn ngày */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Chọn ngày</Text>
              <Text style={styles.sectionSubtitle}>{currentMonth}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
              {availableDates.map(dateItem => (
                <TouchableOpacity
                  key={dateItem.dateStr}
                  style={[
                    styles.dateCard, 
                    selectedDate.dateStr === dateItem.dateStr && styles.dateCardActive
                  ]}
                  onPress={() => setSelectedDate(dateItem)}
                >
                  <Text style={[
                    styles.dateDayLabel, 
                    selectedDate.dateStr === dateItem.dateStr && styles.dateDayLabelActive
                  ]}>
                    {dateItem.dayLabel}
                  </Text>
                  <Text style={[
                    styles.dateDay, 
                    selectedDate.dateStr === dateItem.dateStr && styles.dateDayActive
                  ]}>
                    {dateItem.day}
                  </Text>
                  {dateItem.isToday && (
                    <View style={[
                      styles.todayDot, 
                      selectedDate.dateStr === dateItem.dateStr && styles.todayDotActive
                    ]} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* BƯỚC 2: Chọn chuyên gia (theo ngày) */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Chọn chuyên gia</Text>
              <Text style={styles.sectionSubtitle}>
                {filteredStaffs.length > 0 ? `${filteredStaffs.length} người sẵn sàng` : 'Không có ai'}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : filteredStaffs.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.staffRow}>
                {filteredStaffs.map(staff => (
                  <TouchableOpacity 
                    key={staff.id} 
                    style={[styles.staffCard, selectedStaff === staff.id && styles.staffActive]}
                    onPress={() => setSelectedStaff(staff.id)}
                  >
                    <Image source={{ uri: staff.avatar }} style={styles.staffAvatar} />
                    <Text style={styles.staffName} numberOfLines={1}>{staff.name}</Text>
                    <Text style={styles.staffRole}>{staff.role}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyContainer}>
                <CalendarIcon size={32} color={theme.colors.textMuted} />
                <Text style={styles.emptyText}>Không có chuyên gia làm việc vào ngày này.</Text>
                <Text style={styles.emptyHint}>Hãy thử chọn ngày khác.</Text>
              </View>
            )}
          </View>

          {/* BƯỚC 3: Chọn giờ */}
          {filteredStaffs.length > 0 && selectedStaff && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chọn thời gian</Text>
              <View style={styles.slotGrid}>
                {SLOTS.map(slot => {
                  const isBusy = isSlotBusy(slot);
                  const isPast = isSlotPast(slot);
                  const isDisabled = isBusy || isPast;
                  return (
                    <TouchableOpacity 
                      key={slot}
                      disabled={isDisabled}
                      style={[
                        styles.slot, 
                        selectedSlot === slot && styles.slotActive,
                        isDisabled && styles.slotBusy
                      ]}
                      onPress={() => setSelectedSlot(slot)}
                    >
                      <Text style={[
                        styles.slotText, 
                        selectedSlot === slot && styles.slotTextActive,
                        isDisabled && styles.slotTextBusy
                      ]}>{slot}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

        </ScrollView>

        {/* Floating Footer */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng thanh toán</Text>
            <Text style={styles.priceValue}>{parseInt(service.price).toLocaleString()}đ</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 20 }}>
            <PremiumButton title="Đặt ngay" onPress={handleBooking} />
          </View>
        </View>

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  
  heroSection: { paddingTop: 24, paddingBottom: 0 },
  carouselContainer: { width: '100%', height: 260, marginBottom: 20 },
  imageWrapper: { width: SCREEN_WIDTH - 50, height: 250, paddingHorizontal: 8 },
  carouselImg: { width: '100%', height: '100%', borderRadius: 28, ...theme.shadows.medium },
  pagination: { position: 'absolute', bottom: 25, alignSelf: 'center', flexDirection: 'row' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 4 },
  activeDot: { backgroundColor: 'white', width: 20 },
  
  heroContent: { paddingHorizontal: 24 },
  serviceName: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  serviceDesc: { fontSize: 15, color: theme.colors.textSecondary, marginTop: 8, lineHeight: 22 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 12 },
  statText: { marginLeft: 6, fontSize: 13, fontWeight: '700', color: theme.colors.text },
  
  section: { paddingHorizontal: 24, marginVertical: 12 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  sectionSubtitle: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

  // Date Picker
  dateRow: { paddingRight: 24 },
  dateCard: { 
    width: 56, height: 78, borderRadius: 18, backgroundColor: '#F1F5F9', 
    alignItems: 'center', justifyContent: 'center', marginRight: 10 
  },
  dateCardActive: { backgroundColor: theme.colors.primary },
  dateDayLabel: { fontSize: 12, fontWeight: '600', color: theme.colors.textMuted, marginBottom: 6 },
  dateDayLabelActive: { color: 'rgba(255,255,255,0.7)' },
  dateDay: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  dateDayActive: { color: 'white' },
  todayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 6 },
  todayDotActive: { backgroundColor: 'white' },
  
  // Staff
  staffRow: { marginLeft: -8 },
  staffCard: { width: 110, alignItems: 'center', padding: 12, borderRadius: 20, backgroundColor: '#F8FAFC', marginHorizontal: 8, borderWidth: 2, borderColor: 'transparent' },
  staffActive: { borderColor: theme.colors.primary, backgroundColor: '#EEF2FF' },
  staffAvatar: { width: 64, height: 64, borderRadius: 32, marginBottom: 8 },
  staffName: { fontSize: 14, fontWeight: '700', color: theme.colors.text, textAlign: 'center' },
  staffRole: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },

  // Empty state
  emptyContainer: { alignItems: 'center', paddingVertical: 24, backgroundColor: '#F8FAFC', borderRadius: 16 },
  emptyText: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 10, fontWeight: '600' },
  emptyHint: { color: theme.colors.textMuted, textAlign: 'center', marginTop: 4, fontSize: 12 },
  
  // Time Slots
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 16 },
  slot: { width: '23%', height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  slotActive: { backgroundColor: theme.colors.primary },
  slotBusy: { backgroundColor: '#E2E8F0', opacity: 0.5 },
  slotText: { fontSize: 14, fontWeight: '700', color: theme.colors.textSecondary },
  slotTextActive: { color: 'white' },
  slotTextBusy: { color: theme.colors.textMuted, textDecorationLine: 'line-through' },
  
  // Footer
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    backgroundColor: 'white', padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 25,
    flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' 
  },
  priceContainer: { justifyContent: 'center' },
  priceLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  priceValue: { fontSize: 20, fontWeight: '900', color: theme.colors.primary, marginTop: 2 },
});
