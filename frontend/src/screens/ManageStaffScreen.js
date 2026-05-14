import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, FlatList, 
  TouchableOpacity, Modal, TextInput, Alert, Image, ActivityIndicator, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Trash2, ArrowLeft, Edit2, Calendar, Clock } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { bookingService, staffService } from '../services/api';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function ManageStaffScreen({ navigation }) {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [dayOfWeek, setDayOfWeek] = useState('MON');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  
  // Form state for new staff
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchStaffs();
    fetchServices();
  }, []);

  const fetchStaffs = async () => {
    try {
      const data = await bookingService.getStaffs();
      setStaffs(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const data = await bookingService.getServices();
      setServices(data);
      if (data.length > 0) setSelectedServiceId(data[0].id);
    } catch (error) {
      console.error('Không thể tải danh sách dịch vụ', error);
    }
  };

  const openScheduleModal = async (staff) => {
    setSelectedStaff(staff);
    setScheduleModalVisible(true);
    setDayOfWeek('MON');
    setStartTime('09:00');
    setEndTime('17:00');
    await fetchStaffSchedules(staff.id);
  };

  const fetchStaffSchedules = async (staffId) => {
    try {
      const data = await staffService.getSchedules(staffId);
      setSchedules(data);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lịch làm việc');
    }
  };

  const handleAddSchedule = async () => {
    if (!selectedServiceId || !dayOfWeek || !startTime || !endTime) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin lịch làm việc');
      return;
    }
    try {
      await staffService.createSchedule(selectedStaff.id, {
        serviceId: selectedServiceId,
        dayOfWeek,
        startTime,
        endTime,
        isAvailable: true
      });
      Alert.alert('Thành công', 'Đã thêm ca làm việc');
      fetchStaffSchedules(selectedStaff.id);
      fetchStaffs();
    } catch (error) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể thêm ca làm việc');
      console.error(error);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await staffService.deleteSchedule(selectedStaff.id, scheduleId);
      Alert.alert('Thành công', 'Đã xóa ca làm việc');
      fetchStaffSchedules(selectedStaff.id);
      fetchStaffs();
    } catch (error) {
      Alert.alert('Lỗi', typeof error === 'string' ? error : 'Không thể xóa ca làm việc');
      console.error(error);
    }
  };

  const handleSave = () => {
    if (!fullName || !email || !phone) {
      Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    Alert.alert('Thành công', 'Đã lưu thông tin nhân viên');
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.staffCard}>
      <Image source={{ uri: `https://i.pravatar.cc/150?u=${item.id}` }} style={styles.avatar} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.role}>Chuyên gia Stylist</Text>
        <Text style={styles.contact}>{item.email}</Text>
        <Text style={styles.scheduleSummary}>
          {item.schedules?.length > 0 ? `${item.schedules.length} ca` : 'Chưa có ca'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => openScheduleModal(item)}>
          <Edit2 size={18} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Xác nhận', 'Xóa nhân viên này?')}>
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft color={theme.colors.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý Nhân viên</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={staffs}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có nhân viên hoặc chưa có ca làm việc.</Text>
            </View>
          )}
        />
      )}

      <Modal visible={scheduleModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <Text style={styles.modalTitle}>Lịch làm việc của {selectedStaff?.fullName}</Text>
            <ScrollView style={{ marginBottom: 20 }}>
              {schedules.length === 0 ? (
                <Text style={styles.emptyText}>Chưa có ca làm việc nào.</Text>
              ) : (
                schedules.map(schedule => (
                  <View key={schedule.id} style={styles.scheduleCard}>
                    <View style={styles.scheduleInfo}>
                      <Text style={styles.scheduleText}>{schedule.Service?.name || 'Dịch vụ'}</Text>
                      <Text style={styles.scheduleSub}>{schedule.dayOfWeek} · {schedule.startTime} - {schedule.endTime}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteSchedule(schedule.id)}>
                      <Trash2 size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>Thêm ca mới</Text>

              <Text style={styles.label}>Dịch vụ</Text>
              <View style={styles.serviceList}>
                {services.map(service => (
                  <TouchableOpacity
                    key={service.id}
                    style={[styles.serviceItem, selectedServiceId === service.id && styles.serviceItemActive]}
                    onPress={() => setSelectedServiceId(service.id)}
                  >
                    <Text style={[styles.serviceItemText, selectedServiceId === service.id && styles.serviceItemTextActive]}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Ngày trong tuần</Text>
              <View style={styles.serviceList}>
                {DAYS.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.serviceItem, dayOfWeek === day && styles.serviceItemActive]}
                    onPress={() => setDayOfWeek(day)}
                  >
                    <Text style={[styles.serviceItemText, dayOfWeek === day && styles.serviceItemTextActive]}>{day}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput style={styles.input} placeholder="Bắt đầu (HH:mm)" value={startTime} onChangeText={setStartTime} />
              <TextInput style={styles.input} placeholder="Kết thúc (HH:mm)" value={endTime} onChangeText={setEndTime} />

              <TouchableOpacity style={styles.saveBtn} onPress={handleAddSchedule}>
                <Text style={styles.saveText}>Lưu ca mới</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setScheduleModalVisible(false)}>
              <Text style={styles.closeText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm nhân viên mới</Text>
            <TextInput style={styles.input} placeholder="Họ và tên" value={fullName} onChangeText={setFullName} />
            <TextInput style={styles.input} placeholder="Số điện thoại" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={email} onChangeText={setEmail} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Quay lại</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: 'white' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: theme.colors.text },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: '#F1F5F9' },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },

  staffCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 16, marginBottom: 12, alignItems: 'center', ...theme.shadows.soft },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  role: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
  contact: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  scheduleSummary: { marginTop: 4, fontSize: 12, color: theme.colors.textSecondary },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 8, marginLeft: 8 },
  scheduleBtn: { padding: 8, backgroundColor: '#EFF6FF', borderRadius: 12 },

  emptyState: { padding: 24, alignItems: 'center' },
  emptyText: { color: theme.colors.textMuted, fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', borderRadius: 28, padding: 24, ...theme.shadows.medium },
  modalContentLarge: { backgroundColor: 'white', borderRadius: 28, padding: 24, maxHeight: '90%', ...theme.shadows.medium },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#F1F5F9', height: 52, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  cancelBtn: { padding: 14, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 14, flex: 1, alignItems: 'center' },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '600' },
  saveText: { color: 'white', fontWeight: '800' },
  closeBtn: { marginTop: 12, alignItems: 'center' },
  closeText: { color: theme.colors.primary, fontWeight: '800' },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 10 },
  serviceList: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  serviceItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: '#F8FAFC', marginRight: 8, marginBottom: 8 },
  serviceItemActive: { backgroundColor: theme.colors.primary },
  serviceItemText: { fontSize: 12, color: theme.colors.text, fontWeight: '600' },
  serviceItemTextActive: { color: 'white' },

  scheduleCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 18, marginBottom: 12 },
  scheduleInfo: { flex: 1, marginRight: 12 },
  scheduleText: { fontSize: 14, fontWeight: '700', color: theme.colors.text },
  scheduleSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }
});
